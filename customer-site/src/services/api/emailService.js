const apiUrl = import.meta.env.VITE_APIURL;

export const SendContactFormEmail = async (formRequest) => {
  let payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify(formRequest),
  };

  try {
    const response = await fetch(`${apiUrl}/contact/submitForm`, payload);

    const bodyResponse = await response.json();

    return bodyResponse;
  } catch (error) {
    const errorBodyResponse = await error.json();

    return errorBodyResponse;
  }
};
