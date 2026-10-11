import { TrainingApp } from "../../components/auth/training-app";

export default function AdminPage() {
  return <TrainingApp requiredRole="admin" />;
}

