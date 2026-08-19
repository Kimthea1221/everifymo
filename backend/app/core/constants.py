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
        "under_review": ["takedown_requested", "dismissed", "open"], #added "open", so recalling a verification request can send the complaint back to Ready to Send
        "takedown_requested": ["takedown_initiated", "dismissed"],
        "takedown_initiated": ["completed", "dismissed"],
        "completed": [],
        "dismissed": [],
    },
}

class AuditAction:
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    LOGIN_FAILED = "LOGIN_FAILED"
    UPDATE_COMPLAINT_STATUS = "UPDATE_COMPLAINT_STATUS"
    UPDATE_VERIFICATION_STATUS = "UPDATE_VERIFICATION_STATUS"
    CREATE_REGISTERED_PRODUCT = "CREATE_REGISTERED_PRODUCT"
    CONVERT_TO_REGISTERED_PRODUCT = "CONVERT_TO_REGISTERED_PRODUCT"
    UPDATE_REGISTERED_PRODUCT = "UPDATE_REGISTERED_PRODUCT"
    DELETE_REGISTERED_PRODUCT = "DELETE_REGISTERED_PRODUCT"
    CREATE_UNREGISTERED_ADVISORY = "CREATE_UNREGISTERED_ADVISORY"
    CONVERT_TO_UNREGISTERED_ADVISORY = "CONVERT_TO_UNREGISTERED_ADVISORY"
    UPDATE_UNREGISTERED_ADVISORY = "UPDATE_UNREGISTERED_ADVISORY"
    DELETE_UNREGISTERED_ADVISORY = "DELETE_UNREGISTERED_ADVISORY"
    UPDATE_USER_PROFILE = "UPDATE_USER_PROFILE"
    UPDATE_USER_PASSWORD = "UPDATE_USER_PASSWORD"