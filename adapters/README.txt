StoreNext Pluggable Adapters Folder
-----------------------------------
This directory hosts external commerce adapters (e.g. Medusa, Spurt).

How to install and run an adapter:
1. Build the adapter separately using:
     npm run build:adapter medusa   (or spurt)
2. Copy the compiled folder (dist-adapter/medusa) into this directory:
     dist/adapters/medusa
3. Set active adapter in store-config.json:
     "commerce": { "adapter": "medusa" }
4. Run or restart the standalone server (node server.js).
5. The application will dynamically detect, load, and execute the adapter!
