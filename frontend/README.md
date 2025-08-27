# Data Extractor Frontend

This is the frontend UI for the AI-Powered Business Data Extractor application. It provides a user-friendly interface for creating and managing data extraction jobs, viewing results, and exporting data.

## Features

- User authentication (login/register)
- Job creation and management
- Real-time job progress tracking
- Data preview and filtering
- Export functionality (CSV/Excel)
- Responsive design for all device sizes
- Dark mode support

## Technologies Used

- React.js
- React Router for navigation
- Bootstrap 5 for styling
- React Bootstrap for components
- Axios for HTTP requests
- JWT for authentication
- Chart.js for data visualization
- React Icons for icons
- React Toastify for notifications

## Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your API URL.

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/                 # Source code
│   ├── components/      # React components
│   ├── contexts/        # React contexts
│   ├── App.js           # Main App component
│   ├── index.js         # Entry point
│   └── index.css        # Global styles
├── package.json         # Project dependencies
├── .env.example         # Environment variables template
└── README.md            # This file
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.