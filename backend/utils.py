# distance calculation and duplicate-check logic.

# Rule: If an unresolved issue has the same category and is within about 30 metres, join the new report to it and increase its upvote count.
# The Haversine formula is used to calculate the shortest distance between two places on a round planet (like Earth) using their GPS coordinates (latitude and longitude)
from math import radians, sin, cos, asin, sqrt


def distance_meters(lat1, lon1, lat2, lon2):
    radius = 6371000  # Earth radius in metres

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    )
    c = 2 * asin(sqrt(a))

    return radius * c


def is_duplicate(existing_issue, new_lat, new_lon, new_category):
    if existing_issue.status == "Resolved":
        return False

    if existing_issue.category != new_category:
        return False

    distance = distance_meters(
        existing_issue.latitude,
        existing_issue.longitude,
        new_lat,
        new_lon,
    )

    return distance <= 30