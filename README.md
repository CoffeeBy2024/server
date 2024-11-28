# Welcome to server repository of CoffeeBy ☕🍩

## Mission ☝️
At CoffeeBy, our backend serves as the foundation for brewing connections between coffee lovers and local coffee shops. We aim to provide a robust, secure, and scalable platform that powers seamless interactions, ensuring users can discover their perfect coffee experiences effortlessly.

By supporting features like API-driven coffee shop discovery the CoffeeBy server plays a vital role in uniting enthusiasts with local businesses. Our mission is to ensure every backend process supports the broader vision of creating flavorful and memorable connections over coffee.

Welcome to the CoffeeBy backend, where every connection is powered with precision and care. ☕⚙️

---

## Features 📘
🌐 Robust API for Coffee Shop Management: A powerful backend that provides APIs to manage coffee shops, their offerings, and user interactions.

🛠 Efficient Data Handling: Secure and optimized database management for coffee shops, products, and user data.

🔒 Authentication: Implements secure user authentication.

🚀 Continuous Improvements: Actively maintained to deliver new features and improvements for the backend infrastructure.

---

# Technology stack 💻
- **Backend**: TypeScript, NestJS; 
- **Bundling**: Managed by NestJS
- **Data Bases**: PostgreSQL, MongoDB, Redis
- **ORM**: TypeORM
- **Code Quality**: ESLint, Prettier, Husky
- **Documentation**: Swagger
- **Tests**: Jest
- **Frontend**: CoffeeBy2024/client

*You can find more about the dependencies in the package.json file.*

---

# Setting up and Running Locally 🛠️

To get the CoffeeBy application running locally, follow these instructions:

- **clone repository**: git clone https://github.com/CoffeeBy2024/server.git
- **go to develop branch**: git checkout -b develop
- **pull code**: git pull origin develop
- **install dependencies**: npm install
- **start development server**: npm run start:dev
- **build for production**: npm run build
- **start production server**: npm start:prod

---

# Available Scripts 📝
In the project directory, you can run the following commands:

- **npm run start:dev**: runs your NestJS application in development mode.
- **npm run build**: builds the app for production to the dist folder.
- **npm run npm start:prod**: starts your NestJS application on http://localhost:3001.
- **npm run lint:fix**: formats your code using ESLint according to the rules in .eslintrc.json.
- **npm run prettier:fix**: formats your code using Prettier according to the rules in .prettierrc.
- **npm run prepare**: installs Husky for managing git hooks.
- **npm run test**: runs the unit tests for the NestJS application.
- **npm run test:cov**: runs unit test for Nest and shows coverage.

*You can find more about the scripts in the package.json file.*
