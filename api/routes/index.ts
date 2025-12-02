import { Router, Request, Response, json } from "express";
import UserRouter from "./user-routes";
import UserProfileRouter from "./user-profile-routes"; // Add this
import MembershipRouter from "./membership-routes";
import SubscriptionsRouter from "./subscriptions-routes";
import WorkoutRouter from "./workout-routes";
import UploadRouter from "./upload-routes";


const apiRoute = Router();
apiRoute.use(json());

apiRoute.use("/auth", UserRouter);
apiRoute.use("/user", UserProfileRouter); // Add this
apiRoute.use("/membership", MembershipRouter);
apiRoute.use("/subscriptions", SubscriptionsRouter);
apiRoute.use("/workouts", WorkoutRouter);
apiRoute.use("/upload", UploadRouter);


// HealthCheck
apiRoute.get("/", (req: Request, res: Response) => {
    return res.status(200).send({
        message: "Welcome :)",
        success: "ok",
    });
});

export default apiRoute;