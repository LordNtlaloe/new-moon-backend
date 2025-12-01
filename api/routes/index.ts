import { Router, Request, Response, json } from "express";
import UserRouter from "./user-routes";
import MembershipRouter from "./membership-routes";
import SubscriptionsRouter from "./subscriptions-routes";
import WorkoutRouter from "./workout-routes"; // Add this

const apiRoute = Router();
apiRoute.use(json());

apiRoute.use("/auth", UserRouter);
apiRoute.use("/membership", MembershipRouter);
apiRoute.use("/subscriptions", SubscriptionsRouter);
apiRoute.use("/workouts", WorkoutRouter); // Add this

// HealthCheck
apiRoute.get("/", (req: Request, res: Response) => {
    return res.status(200).send({
        message: "Welcome :)",
        success: "ok",
    });
});

export default apiRoute;