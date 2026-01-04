import AppShell from "@/app/AppShell";
import ErrorBoundary from "@/app/components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <AppShell />
    </ErrorBoundary>
  );
}
