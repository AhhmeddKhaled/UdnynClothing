
export function formValidition(inputType, value) {
  if (inputType === "email") {
    const emailRegex = /\w+b*@(gmail|yahoo).com/i;
    const emailValid = emailRegex.test(value);
    (emailValid);

    const message = emailValid
      ? "Valid Email"
      : "Email Not Valid, Please Try Again";

    return { emailValid, message };
  }

  if (inputType === "password") {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    const passwordValid = passwordRegex.test(value);

    (passwordValid);
    
    const message = passwordValid
      ? "Valid Password"
      : "Password must be at least 8 characters and include a capital letter, a special character (@ or #), and a number.";

    return { passwordValid, message };
  }

  return {
    isValid: false,
    message: null,
  };
}
