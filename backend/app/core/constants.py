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