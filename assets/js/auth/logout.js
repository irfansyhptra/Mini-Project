const onLogout = async () => {
  const logoutButton = document.getElementById("logout-user");
  logoutButton.addEventListener("click", async () => {
    const token = window.localStorage.getItem("token");
    try {
      const response = await fetch(
        "https://serverkita.vercel.app/auth/logout",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const res = await response.json();

      if (res.status === 200) {
        window.localStorage.setItem("token", "");
        window.localStorage.setItem("user", "");
        window.location.href = "/index.html";
      } else {
        alert(res.message);
      }
    } catch (error) {}
  });
};

onLogout();
