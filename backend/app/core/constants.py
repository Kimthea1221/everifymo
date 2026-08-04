class Role:
    SUPERADMIN = "superadmin"
    FDA_PERSONNEL = "fda_personnel"
    LEA_PERSONNEL = "lea_personnel"


class UserStatus:
    INVITED = "invited"
    PENDING_APPROVAL = "pending_approval"
    ACTIVE = "active"

    #to be worked on later, optional
    REJECTED = "rejected"
    RETURNED = "returned"


# Which complaint statuses are allowed to move to which other
# statuses, per source. Prevents accidentally skipping steps (e.g.
# jumping straight from 'open' to 'completed') or moving a complaint
# somewhere it can never leave (like 'dismissed' -> anything).
VALID_COMPLAINT_TRANSITIONS = {
    "extension": {
        "open": ["under_review", "dismissed"],
        "under_review": ["takedown_requested", "dismissed"],
        "takedown_requested": ["completed", "dismissed"],
        "completed": [],
        "dismissed": [],
    },
    "walk_in": {
        "open": ["under_review", "dismissed"],
        "under_review": ["takedown_requested", "dismissed"],
        "takedown_requested": ["takedown_initiated", "dismissed"],
        "takedown_initiated": ["completed", "dismissed"],
        "completed": [],
        "dismissed": [],
    },
}