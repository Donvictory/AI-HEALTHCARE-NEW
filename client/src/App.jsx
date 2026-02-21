import { router } from "./routes";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "./Components/ui/sonner";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
