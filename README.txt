North Star Bakery Touchstone 4

This extends the same four-page North Star Bakery project from Touchstone Tasks 2 and 3. styles.css preserves its four-color, two-font responsive design. script.js adds product filtering, saved favorites, cross-page item-detail prefilling, and custom form validation. No build step or third-party scripts are required.

Open index.html using a static web server. For example, run python3 -m http.server 8000 from this folder and open the forwarded address in your IDE.

Try Products > Breads > Save favorite. Refresh to see the category and saved favorite restore. Follow Use favorites in a request to see item details prefilled. Submit incomplete or invalid contact entries to see field-level errors; correct them to see a local review. No request is sent and no items are reserved.

localStorage key: northStarBakery.preferences.v1. Only product IDs and category choice are stored. Contact and allergy information are not stored. Clear favorites removes the saved list; the category remains remembered. If storage is blocked or damaged, the page remains usable with defaults and a storage notice.

Code organization: products and formFields arrays; product and preferences objects; separate render, persistence, initialization, prefilling, and validation functions. User-entered text is placed with textContent. Basic native form validation remains available without JavaScript.

Business details and prices are illustrative student content. Media comes from Sophia's provided North Star Bakery asset ZIP.
