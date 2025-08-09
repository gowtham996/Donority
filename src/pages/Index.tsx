import React from "react";

const Index = () => {
  return (
    <main className="min-h-screen">
      <iframe
        title="Donority — Donation & Charity Platform"
        src="/donority/index.html"
        className="w-full min-h-screen border-0"
      />
      <noscript>
        <div className="p-6 text-center">
          JavaScript is required. Open /donority/index.html directly.
        </div>
      </noscript>
    </main>
  );
};

export default Index;
