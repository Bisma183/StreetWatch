"""Expo Push API sender (requires internet and a native build with EAS project ID)."""
import json
import logging
from urllib.request import Request, urlopen
from urllib.error import URLError

logger=logging.getLogger(__name__)

def send_status_push(tokens,issue_id,category,status):
    tokens=list(dict.fromkeys(t for t in tokens if t))
    if not tokens:return
    messages=[{"to":t,"title":"StreetWatch status updated","body":f"{category} #{issue_id} is now {status}","data":{"issueId":issue_id,"status":status},"sound":"default"} for t in tokens]
    data=json.dumps(messages).encode("utf-8")
    req=Request("https://exp.host/--/api/v2/push/send",data=data,headers={"Content-Type":"application/json"},method="POST")
    try:
        with urlopen(req,timeout=8) as response:
            result=json.loads(response.read().decode("utf-8"))
            logger.info("Expo push gateway response: %s",result)
    except (OSError,ValueError,URLError) as error:
        logger.warning("Could not deliver push messages: %s",error)
