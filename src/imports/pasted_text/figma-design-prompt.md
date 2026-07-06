This is a comprehensive request, covering the end-to-end process from conceptual design in Figma to technical execution as a modern full-stack application with an Electron.js desktop companion.

Here is the detailed, structured prompt for Figma to design the UI/UX, followed by the modern steps to build it for the construction industry.

### Part 1: Figma UI/UX Design Prompt

Copy and use this prompt in Figma to define the scope and style of your design system and individual frames.

---

**Prompt for Figma:**

**Project Context:** Modern, high-fidelity UI/UX design kit for a comprehensive construction management software and responsive web application. Focus on clarity, data visualization, and streamlined workflows.
**Industry:** Construction/Real Estate Management.
**Design Style:** Clean, professional, minimalistic, flat design. Primary color palette of deep blue (like Navy/Sapphire) for navigation and titles, with accent colors of light sky blue, light green (for success/profit), and orange (for warnings/overdue). Use modern, clean typography (e.g., Inter or Roboto). Dark mode variations should be included for all frames. Include clean, modern line-icons for all navigation items.

**Global Elements (Persistent across all views):**

* **Detailed Left Navigation:** A vertical menu bar. At the top, a placeholder for the "Construction Management System" logo. Below it, the menu items with clean icons and labels: Dashboard, Customer Sales, Inventory, Shareholder, Projects, Settings. The active item should be highlighted.
* **Top Bar:** A persistent top bar with the title of the current page (e.g., "Dashboard") and a user profile dropdown/icon on the far right.

**Frame 1: Dashboard (Based on image_0.png)**

* **Main Body:** A main area titled "Dashboard". A grid of high-fidelity 'KPI Cards'.
* **Row 1 KPI Cards:** "Total booked flats" (count and percentage), "Remaining flats" (count and percentage), "Remaining Investment / Total" (A clean progress bar or ratio display comparing remaining vs. total investment).
* **Row 2 KPI Cards:** "Overdue" (a large, prominent number with a clear link to a detailed list), "Total sales amount", "Current Material Cost" (Sub-text: "Production Cost: fix cost increase or decrease ratio". *Note: This card should include a very small, clean line-chart showing cost trends.*).


* **Below cards:** Create two separate, clean list tables side-by-side or stacked vertically: "Recent Booking" and "Recent Investment".
* **Bottom Section:** A prominent, styled, action-oriented button or panel titled "Recent Payment Request".

**Frame 2: Customer Sales (Based on image_1.png)**

* **Frame Title:** "Customer Sales".
* **Subtitle Section:** "Total sales site wise" with a site selection dropdown filter.
* **Top Row KPI Cards:** "Total Cust.", "Booked Flat", "Remaining Flat".
* **Overdue Detail:** A large detail card or section focused on 'Overdue', maybe showing a list of recent overdue customers with interaction links.
* **Recent Customers List:** A modern list/table structure titled "Recent Customers". Columns should include Customer Name, Flat No, Floor No, Payment Status, Project. The row from the sketch should be a stylized table.
* **Add Customer Action:** A modern button titled "Add Customer" featuring a stylized [+ Icon].
* **Data Visualization - Key Feature:** A prominent, interactive dual-ring doughnut chart. Create a precise, detailed legend next to the chart using hatched and solid patterns that correspond exactly to the legend keys from image_1.png:
* `[hatched pattern] 100%` (Total)
* `[solid pattern] Booked 80% full Payment`
* `[different hatched pattern] 50%`
* `[different solid pattern] 10% booking amount`



**Frame 3: Add Customer / Detail View (Based on image_2.png)**

* **Detailed Form View:** Titled "Add Customer." (Or as a detailed page that doubles as a form).
* **Customer Unique ID:** A dedicated field with a button next to it: `[Customer Unique ID Generate field & button]`.
* **Form Groups (Using modern input boxes with labels and placeholders):**
* **Personal Information:** Group: `Name`, `Phone No`, `Email`, `Address`.
* **Unit Location:** Group: `Flat No`, `Floor No`, `Project/Site`.
* **Financials:** Group: `Total Amount`, `Booking amount`, `Tax + Registration Amount`.


* **Dynamic Sections:**
* **Payment Slabs (List):** An expandable list titled `[-] Steps of Amount Slabs` with examples. Include a header for the entire dynamic list. The first item in the list must be a text-only entry: `(1) Booked Amount -> this fix`.
* **Add Step Interaction:** Below the last step, a `[+] Add Next Step ->` button/entry point. Clicking this should reveal input fields for `Amount` (number field) and a `Payment Method` (dropdown with example sub-types listed below the dropdown: `Cash`, `Bank`, `UPI`, `Cheque`).


* **Booked Flats Interactive Grid (Key Feature):** Create a filterable grid view.
* **Filter Sidebar (Left):** Filters for `1 BHK`, `2 BHK`, `S BHK`.
* **Interactive Grid:** A grid of individual, numbered 'flat cards' (e.g., showing numbers 201, 203, 204). The design must define this interaction: upon click of a numbered flat card, a modal or detailed sidebar should open showing 'Customer Name' associated with it, or a 'Booking Form' if empty. The flat numbers are a critical part of the design.



---

### Part 2: Modern Website Creation Steps (Construction Industry Purpose)

To turn these wireframes and your figma design into a production-ready application that spans the web and desktop (Electron), you should adopt a modern, full-stack, component-based approach.

Here is the step-by-step methodology:

#### Phase 1: Planning & Architecture

1. **Define User Personas:** Identify key users (e.g., Construction Site Manager, Sales Representative, Finance Manager) and their core workflows (e.g., track unit inventory, register new customers, oversee cash flow).
2. **Define Key Business Goals:** Focus on what this software *solves* (e.g., "Reduce overdue payments by 25%", "Centralize multi-site data"). This guides prioritization.
3. **Define MVP (Minimum Viable Product):** Select the core loop from your wireframes for the first release. For example: `Project Setup` -> `Unit Inventory (Flat Grid)` -> `Add Customer` -> `Basic Dashboard Tracking`. (Inventory/Shareholders might wait for v2).
4. **Technology Stack Selection:**
* **Frontend (Web & Electron):** Use a component-driven framework. (e.g., React, Vue.js, or Svelte are modern standards). Pair this with a utility-first CSS framework like Tailwind CSS for rapid, scalable styling that matches your Figma system.
* **State Management:** For complex apps, use a robust library. (e.g., Redux Toolkit or Pinia) to manage customer data, dashboard states, and grid interactions globally.
* **Database:** For structured construction records, a relational database is essential. (e.g., PostgreSQL or MySQL).
* **Backend (API):** Create a secure, scalable API. (e.g., Node.js with Express or NestJS, or a modern solution like Python with FastAPI or Go).



#### Phase 2: Design System & Iteration

5. **Build a Figma Design System:** Before building pages, build components in Figma (buttons, inputs, cards, charts, icons, typography styles). Use color to indicate state (success/warning).
6. **Develop Interactive Figma Prototypes:** Create clickable prototypes for all key flows:
* Add a new customer from the Sales page.
* Filter the flat grid and click a numbered flat to see detail.
* Navigate between left nav items and see the active highlight.



#### Phase 3: Frontend Development (Modernized)

7. **Component-Driven Development:** Build individual UI components (e.g., `StatCard`, `FlatGridItem`, `CustomerListRow`) in isolation using the style guide.
8. **Setup Frontend Routing:** Use client-side routing to manage page transitions (`/dashboard`, `/sales`, `/add-customer`) without page reloads.
9. **Implement Data Visualization:** Use modern chart libraries (e.g., ApexCharts, Chart.js, or Recharts) to build the dual-ring doughnut chart and sparkline charts for the material cost. *Specifically code the complex legend for the doughnut chart.*
10. **Form Management:** For the customer add form, use modern form libraries (e.g., React Hook Form or Formik) to manage validation, states, and dynamic fields like payment slabs.

#### Phase 4: Backend & API Development

11. **Database Schema Design:** Design tables that reflect your data: `Projects`, `Flats` (linked to project, status), `Customers`, `SalesRecords`, `PaymentSlabs`, `Users`. Use Foreign Keys to link them.
12. **Build REST or GraphQL API Endpoints:** Create secure endpoints for all CRUD operations (`/api/flats`, `/api/customers`, `/api/add-payment-step`).
13. **Security First:** Implement authentication (e.g., JWT, OAuth) and role-based access control. (A site manager can't edit settings). Encrypt all sensitive customer data.

#### Phase 5: Electron JS Desktop Application Integration

14. **Initialize Electron:** Set up the Electron wrapper around your modern web frontend.
15. **Native Integration:** Decide where the desktop app needs native features. (e.g., generate and save PDF reports locally, send native OS notifications for payment due dates). *The desktop app should feel more "integrated" than a browser tab.*
16. **Build Process:** Implement build automation to create installers for Windows, macOS, and Linux from the same codebase.

#### Phase 6: Devops, Testing & Deployment

17. **Automated Testing:** Implement a comprehensive testing strategy. (Unit tests for components, Integration tests for API flows, and E2E (End-to-End) tests like Cypress for key user flows).
18. **CI/CD Pipeline:** Set up automated pipelines (e.g., GitHub Actions, Jenkins) to automatically test, build, and deploy changes.
19. **Modern Hosting:** Host the web frontend on a modern platform (e.g., Vercel, Netlify). Deploy the API on a scalable cloud service (e.g., AWS, DigitalOcean). Use database managed services.
20. **Analytics:** Implement basic analytics to track software usage and errors, informing future iterations.