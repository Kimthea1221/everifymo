def format_officer_display_name(user) -> str | None:
    """
    Builds "FirstName LastName" (e.g. "R. Dela Cruz") from
    a User row. Any of the two parts can be null — officers can be
    invited but not fully set up yet — so only present parts are
    joined. Returns user.email if every part is missing.
    Shared by any endpoint that needs to display who requested or
    responded to something.
    """
    if not user:
        return None
    name_parts = [user.first_name, user.last_name]
    assembled = " ".join(part for part in name_parts if part is not None)
    if assembled and assembled.strip():
        return assembled
    return user.email