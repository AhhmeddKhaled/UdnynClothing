
export function formValidition(inputType, value) {
  if (inputType === "email") {
    const emailRegex = /\w+b*@(gmail|yahoo).com/i;
    const emailValid = emailRegex.test(value);
    console.log(emailValid);

    const statusMessage = emailValid
      ? "Valid Email"
      : "Email Not Valid, Please Try Again";

    return { emailValid, statusMessage };
  }

  if (inputType === "password") {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[@#])(?=.*\d).{8,}$/;
    const passwordValid = passwordRegex.test(value);

    console.log(passwordValid);
    
    const statusMessage = passwordValid
      ? "Valid Password"
      : "Password must be at least 8 characters and include a capital letter, a special character (@ or #), and a number.";

    return { passwordValid, statusMessage };
  }

  return {
    isValid: false,
    statusMessage: null,
  };
}
