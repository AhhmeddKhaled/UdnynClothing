
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login, HomeRedirect } from "../services/UsersServices";
import { formValidition } from "../services/LoginServices.js";

export default function useLoginLogic() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [emailValid, setEmailValid] = useState(false);
    const [phoneValid, setPhoneValid] = useState(false);
    const [passwordValid, setPasswordValid] = useState(false);
    const [valid, setvalid] = useState(false);
    const navigate = useNavigate();

    const handleChange = (value, inputOptions) => {
        const result = formValidition(inputOptions.type, value);

        if (inputOptions.type === "email") {
            setEmailValid(result.emailValid);
        }

        if (inputOptions.type === "password") {
            setPasswordValid(result.passwordValid);
        }

        if (inputOptions.type === "tel") {
            setPhoneValid(result.phoneValid);
            setvalid(phoneValid);
        }

        setStatusMessage(result.message);
    };

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);
            navigate(HomeRedirect(), { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        handleSubmit,
        handleChange,
        handleShowPassword,
        showPassword,
        valid,
        emailValid,
        passwordValid,
        phoneValid,
        statusMessage,
        email,
        setEmail,
        password,
        setPassword,
        error,
        loading
    }
}