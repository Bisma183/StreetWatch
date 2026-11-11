"""Offline pytest tests; temporary in-memory SQLite. Run: python -m pytest -q."""
import os,io
os.environ.setdefault('SECRET_KEY','test-secret-only-never-production-12345')
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from database import Base,get_dbsession
from main import app
from models import User
from utils import distance_meters,is_duplicate
from types import SimpleNamespace
@pytest.fixture
def env():
    engine=create_engine('sqlite://',connect_args={'check_same_thread':False},poolclass=StaticPool)
    Base.metadata.create_all(engine)
    Session=sessionmaker(bind=engine)
    def override():
        with Session() as db:yield db
    app.dependency_overrides[get_dbsession]=override
    with TestClient(app) as client:yield client,Session
    app.dependency_overrides.clear();engine.dispose()
def auth(client,email='demo@example.com'):
    assert client.post('/register',json={'name':'Demo','email':email,'password':'password123'}).status_code==200
    r=client.post('/login',json={'email':email,'password':'password123'})
    assert r.status_code==200
    return {'Authorization':'Bearer '+r.json()['access_token']}
def report(client,headers,cat='Pothole',lat='24.8607'):
    return client.post('/issues',headers=headers,data={'category':cat,'latitude':lat,'longitude':'67.0011','note':'test'},files={'photo':('photo.jpg',io.BytesIO(b'\xff\xd8\xff'+b'a'*100),'image/jpeg')})
def test_distance_and_duplicate():
    assert 9<distance_meters(24.86,67,24.86009,67)<11
    p=SimpleNamespace(category='Pothole',latitude=24.86,longitude=67,status='Reported')
    assert is_duplicate(p,24.8601,67,'Pothole')
    assert not is_duplicate(p,24.8601,67,'Garbage')
    assert not is_duplicate(p,24.861,67,'Pothole')
    p.status='Resolved';assert not is_duplicate(p,24.8601,67,'Pothole')
def test_auth_and_permissions(env):
    client,_=env
    assert client.get('/me').status_code==401
    headers=auth(client)
    assert client.get('/me',headers=headers).json()['is_admin'] is False
    assert client.get('/me',headers={'Authorization':'Bearer invalid'}).status_code==401
    assert report(client,{}).status_code==401
def test_report_merge_and_filters(env):
    client,_=env;h=auth(client)
    r=report(client,h);assert r.status_code==201,r.text
    id=r.json()['issue']['id'];assert r.json()['merged'] is False
    r2=report(client,h,lat='24.8608');assert r2.status_code==201,r2.text
    assert r2.json()['merged'] is True and r2.json()['issue']['id']==id
    assert r2.json()['issue']['upvote_count']==2
    assert len(client.get(f'/issues/{id}').json()['reports'])==2
    assert report(client,h,cat='Garbage').json()['issue']['id']!=id
    assert len(client.get('/issues?category=Pothole').json())==1
    assert client.post(f'/issues/{id}/upvote',headers=h).json()['upvote_count']==3
def test_reject_invalid_photo(env):
    client,_=env;h=auth(client)
    r=client.post('/issues',headers=h,data={'category':'Pothole','latitude':'24.86','longitude':'67'},files={'photo':('test.txt',io.BytesIO(b'text'),'text/plain')})
    assert r.status_code==422
def test_admin_workflow(env,monkeypatch):
    client,Session=env;h=auth(client);id=report(client,h).json()['issue']['id']
    assert client.patch(f'/issues/{id}/status',headers=h,data={'status':'Verified'}).status_code==403
    assert client.delete(f'/issues/{id}',headers=h).status_code==403
    with Session() as db:
        u=db.query(User).first();u.is_admin=True;db.commit()
    import routers.issues as routes
    monkeypatch.setattr(routes,'send_status_push',lambda *args:None)
    assert client.patch(f'/issues/{id}/status',headers=h,data={'status':'Resolved'}).status_code==422
    for stage in ['Verified','In Progress','Resolved']:
        r=client.patch(f'/issues/{id}/status',headers=h,data={'status':stage});assert r.status_code==200,r.text
    assert client.patch(f'/issues/{id}/status',headers=h,data={'status':'Reported'}).status_code==422
    assert client.delete(f'/issues/{id}',headers=h).status_code==204
    assert client.get(f'/issues/{id}').status_code==404
