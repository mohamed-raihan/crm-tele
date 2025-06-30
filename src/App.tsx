import RootLayout from "./app/layout";
import { AppRouter } from "./app/router";
import { AuthProvider } from "@/hooks/AuthContext";

const App = () => (
  <AuthProvider>
    <RootLayout>
      <AppRouter />
    </RootLayout>
  </AuthProvider>
);

export default App;
