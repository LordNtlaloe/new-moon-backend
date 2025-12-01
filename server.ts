import app from "./app";

const port = process.env.PORT || 5001;

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default server;