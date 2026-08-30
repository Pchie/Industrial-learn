# Platform Owner Guide

1. Open the staging sign-in page: <https://industrial-learn-git-development-kolobe.vercel.app/auth/sign-in?next=%2Fworkspace>.
2. Sign in with the authorised account whose database role is `platform_owner`.
3. The workspace portal is `/workspace`; the management workspace is `/owner`.
4. Use **Workspace** in the header to switch between Student, Author, Reviewer, Lecturer,
   and Owner views. This does not impersonate another person.
5. Select **Reviewer** to enter `/review`.
6. Under **Awaiting review**, open **Basic Fluid Pressure**, item
   `LES-FLUID-PRESSURE-001`, content version `0.4.0`.
7. Select **Preview as Student**. Confirm the visible `PREVIEW — NOT PUBLISHED` banner.
8. To appoint an independent reviewer, open `/admin/users`, choose **Invite a role holder**
   or assign `engineering_reviewer` to an existing trusted account, enter an audit reason,
   and confirm the change.
9. Return to `/review` and inspect Awaiting review, Changes requested, Approved, and Review
   history.
10. The owner may inspect and manage the workflow but cannot record the independent
    engineering decision. A separate qualified Engineering Reviewer must approve the
    lesson. Approval still does not publish it.

Never share a password, access token, service-role key, or database URL while following
this guide.
