import { FC } from "react";
import { useRouteError } from "react-router-dom";

export const ErrorPage: FC = () => {
    const error: any = useRouteError();

    const goBack = () => {
        window.history.back();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="max-w-md p-6 bg-white rounded-md shadow-md text-center">
                <h2 className="text-4xl font-bold text-red-500 mb-4">{error.statusText || error.message}</h2>
                <p className="text-gray-600 mb-6">
                    Oops! Something went wrong. The page you are looking for might be
                    unavailable.
                </p>
                <button
                    onClick={goBack}
                    className="px-4 py-2 text-white bg-blue-500 rounded-md focus:outline-none focus:shadow-outline-blue"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

