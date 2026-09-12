import { getClients } from "../services/client.service.js";
export const listClients = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Authentication required",
                },
            });
        }
        const clients = await getClients();
        return res.json({
            success: true,
            data: {
                clients,
            },
        });
    }
    catch (error) {
        console.error("Failed to fetch clients:", error);
        return res.status(500).json({
            success: false,
            error: {
                code: "SERVER_ERROR",
                message: "Unable to fetch clients",
            },
        });
    }
};
//# sourceMappingURL=client.controller.js.map