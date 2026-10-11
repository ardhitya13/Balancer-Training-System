# Frontend Structure

```text
src/
  app/
    page.tsx
    layout.tsx
    globals.css
    favicon.ico
    admin/
      page.tsx
      components/
        admin-content.tsx
        admin-users.tsx
    trainee/
      page.tsx
      components/
        trainee-dashboard.tsx
        training-materials.tsx
        training-practice.tsx
        training-practice.module.css
        qr-simulator.tsx
        product-catalog.tsx
        standard-training.tsx
    login/
      page.tsx
      components/
        login-screen.tsx
  components/
    auth/
      training-app.tsx
    layout/
      training-workspace.tsx
  data/
    training/
      learning-content.ts
      practice-data.ts
      standard-lesson.ts
      rework-content.ts
  lib/
    training/
      training-store.ts
      balancer-workflow.ts
      qr-training.ts
```

- `app/admin`: admin route and admin-specific account/content components.
- `app/trainee`: trainee route and learning/practice components.
- `app/login`: login route and login form.
- `components/auth`: shared local session gate and role routing.
- `components/layout`: shared workspace and navigation.
- `data/training`: built-in learning content.
- `lib/training`: local persistence, scoring, and simulator logic.

Routes: `/` redirects to `/login`. After login, admins open `/admin` and trainees open `/trainee`. Access checks continue to use browser-local demo accounts. The browser storage keys and saved content are unchanged.

