"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export function CookingLoader() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-48 h-48">
        <DotLottieReact src="/animations/cooking.json" loop autoplay />
      </div>
      <p className="text-[10px] text-muted/50 mt-2">
        <a
          href="https://iconscout.com/lottie-animations/cooking"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Cooking
        </a>
        {" by "}
        <a
          href="https://iconscout.com/contributors/google-inc"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Google Inc.
        </a>
        {" on "}
        <a
          href="https://iconscout.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          IconScout
        </a>
      </p>
    </div>
  );
}
