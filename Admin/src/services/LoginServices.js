
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

    const message = passwordValid
      ? "Valid Password"
      : "Password must be at least 8 characters and include a capital letter, a special character (@ or #), and a number.";

    return { passwordValid, message };
  }

  if (inputType === "tel") {
    const phoneRegex = /\d{11}/;
    const phoneValid = phoneRegex.test(value);

    const message = phoneValid
      ? "Valid Phone Number"
      : "Phone must be at least 11 Numbers, And Starting (010 - 011 - 012 - 015)";

    return { phoneValid, message };
  }



  return {
    isValid: false,
    message: null,
  };
}
