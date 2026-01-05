import React from "react";
import { History } from "lucide-react";

const LoginHistoryPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto card-premium p-8 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <History className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Login History</h1>
            <p className="text-sm text-muted-foreground">Recent sign-ins for your account.</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
          <p className="text-sm text-muted-foreground">No login events to show yet.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginHistoryPage;
