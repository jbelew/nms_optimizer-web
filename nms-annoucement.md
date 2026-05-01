# NMS Optimizer v7.0: The Final Major Release

👉 **Try it now:** [https://nms-optimizer.app/](https://nms-optimizer.app/)

Hey Travelers,

Did you know there are roughly **8.32 × 10⁸¹** ways to arrange modules on a fully expanded **10x6 technology grid**? That’s more permutations than there are atoms in the observable universe. Most players leave **15-20% of their potential stats** on the table because the math is simply too complex to solve by hand.

Today, we're rolling out **v7.0 of the NMS Optimizer**. This is our final planned major feature release, bringing the tool to its most stable and powerful state yet. We’ve built the engine to handle the current technology meta for the long haul, ensuring your **Starships, Multi-Tools, Exosuits, Exocraft, Freighters, and Corvettes** stay at peak performance.

---

### What’s new in v7.0?

* 🇮🇹 **Benvenuto! Italian is here**: We’ve finished the Italian translation, rounding out our support for major European languages alongside Spanish, French, German, and Portuguese.
* ⚡ **Instant-Load Strategy**: We’ve refactored the entire app using **Vite 8 and Rolldown**. Dialogs and styles now load exactly when you need them, which slashes the initial download size and fixes the "layout jumping" some of you saw on slower connections.
* 🛡️ **Privacy & Compatibility**: We’ve put a lot of work into stability for travelers using incognito mode or browsers with strict privacy settings. The app is now much more resilient and will remain fully functional even when your browser is set to "maximum lockdown."
* ✨ **Accessibility Polish**: We’ve tweaked the desktop background contrast for **Focus Mode** to make the *Atkinson Hyperlegible Next* font even easier to read for travelers with visual challenges.
* 📱 **Installable PWA**: The NMS Optimizer is a Progressive Web App! You can "Install" or "Add to Home Screen" directly from your mobile browser to use it just like a native app on your phone or tablet.

---

### Under the Hood: The 4-Step Pipeline

The NMS Optimizer doesn't just guess. It uses a sophisticated engineering pipeline to find your best build:

1. **Pattern Matching**: We start with hand-tested, community-proven arrangements.
2. **Machine Learning**: A **TensorFlow** model (trained on 16,000+ high-scoring layouts) predicts the smartest placements for your unique supercharged slots.
3. **Simulated Annealing**: Our **Rust-powered engine** rapidly swaps modules, testing hundreds of thousands of permutations per second to climb toward the mathematical optimum.
4. **Validation**: Every result is cross-checked against in-game adjacency rules before it hits your screen.

---

### The Evolution of the Optimizer

It's been just over a year from a simple grid prototype to a Rust-powered ML engine. Here is how we got here:

* **The Alpha Days (v0.9)**: The project started as a basic grid tool with a "brute-force" solver. It worked, but it was slow and struggled with complex layouts.
* **The ML Revolution (v2.0)**: We introduced **TensorFlow-based solves**, resulting in a 5x performance boost. We also added support for **Multi-Tools** and high-quality grid assets.
* **The Community Meta (v3.0)**: We added **Recommended Builds**, **User Statistics**, and **Share Links**, allowing the community to finally see and share the global "meta" for supercharged slots.
* **The Accessibility Focus (v4.0)**: Introduced **Focus Mode** (utilizing *Atkinson Hyperlegible*) and the ability to choose which specific modules to include in a solve.
* **The Rust Revolution (v5.0)**: A massive milestone where we rewrote the core engine in **Rust**, making the solver **38x faster** and capable of running much deeper optimization passes.
* **Build Management (v6.0)**: Local saving and loading of builds (`.nms` files) was added, alongside built-in **high-res screenshots** for sharing your optimized layouts.
* **The Final Frontier (v7.0)**: Our transition to **Vite 8 / Rolldown**, full Italian support, and a hyper-resilient delivery pipeline designed to last as long as the game does.

---

### 100% Free and Open Source

This remains a labor of love for the *No Man's Sky* community. It is 100% free, has zero ads, and collects no personal data. The project is fully open-source (GPL-3.0) and available for anyone to audit or contribute to on GitHub.

* **Web UI**: [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
* **Backend**: [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

**Start Optimizing:** 👉 [https://nms-optimizer.app/](https://nms-optimizer.app/)

A huge thank you to the community members who have reported bugs, submitted translations, and shared their builds. If you find a bug or have a suggestion, please [open an issue on GitHub](https://github.com/jbelew/nms_optimizer-web/issues).

May your supercharged slots always be adjacent!

Fly safe! 🚀
