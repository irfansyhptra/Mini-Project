document.addEventListener("DOMContentLoaded", function () {
  // --- Pemilihan Elemen DOM ---
  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const loginButton = document.getElementById("login-button");
  const passwordToggle = document.getElementById("toggle-password");
  const messageContainer = document.getElementById("message-container"); // Direkomendasikan: tambahkan <div id="message-container"></div> di HTML Anda

  // Simpan teks tombol asli
  const originalButtonText = loginButton ? loginButton.textContent : "Masuk";

  // --- Fungsi Bantuan (Helper Functions) ---

  /**
   * Menampilkan pesan (error atau success) di container.
   * @param {string} message - Pesan yang akan ditampilkan.
   * @param {'error' | 'success'} type - Tipe pesan ('error' atau 'success').
   */
  function showMessage(message, type = 'error') {
    // Jika container tidak ada, gunakan alert sebagai fallback
    if (!messageContainer) {
      alert(message);
      return;
    }

    messageContainer.innerHTML = message;
    messageContainer.className = `message ${type}`; // Atur kelas untuk styling (misal: 'message error' atau 'message success')
    messageContainer.classList.remove("hidden");

    // Sembunyikan setelah beberapa detik (opsional)
    setTimeout(() => {
        if (messageContainer) {
            messageContainer.classList.add("hidden");
            messageContainer.innerHTML = '';
        }
    }, 5000);
  }

  /**
   * Mengatur status loading pada tombol.
   * @param {boolean} isLoading - Apakah sedang loading atau tidak.
   */
  function setLoading(isLoading) {
    if (!loginButton) return;

    if (isLoading) {
      loginButton.disabled = true;
      loginButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Memproses...';
    } else {
      loginButton.disabled = false;
      loginButton.innerHTML = originalButtonText;
    }
  }

  // --- Fungsi Toggle Password ---
  function setupPasswordToggle() {
    if (!passwordToggle || !passwordInput) return;

    passwordToggle.addEventListener("click", () => {
      const isPassword = passwordInput.getAttribute("type") === "password";
      passwordInput.setAttribute("type", isPassword ? "text" : "password");

      const icon = passwordToggle.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-eye", !isPassword);
        icon.classList.toggle("fa-eye-slash", isPassword);
        passwordToggle.setAttribute("aria-label", isPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi");
      }
    });
  }

  // --- Fungsi Penanganan Login ---
  async function handleLogin(event) {
    event.preventDefault(); // Mencegah submit form bawaan

    if (!emailInput || !passwordInput) {
        showMessage("Elemen form tidak ditemukan.", 'error');
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Validasi input dasar
    if (!email || !password) {
      showMessage("Email dan kata sandi tidak boleh kosong.", 'error');
      return;
    }

    setLoading(true);
    if (messageContainer) messageContainer.classList.add("hidden"); // Sembunyikan pesan lama

    // !!! PERINGATAN KEAMANAN: HAPUS BAGIAN INI DI PRODUKSI !!!
    if (email === "admin@gmail.com" && password === "admin") {
      console.warn("LOGIN ADMIN HARDCODED DIGUNAKAN! HANYA UNTUK DEVELOPMENT!");
      localStorage.setItem("token", "admin-token-placeholder-dev-only");
      localStorage.setItem("user", JSON.stringify({ email: "admin@gmail.com", role: true, name: "Administrator" }));
      showMessage("Login admin berhasil! Mengalihkan...", 'success');
      setTimeout(() => {
        window.location.href = window.location.origin + "/SILAPOR-FrontEnd/page/dashboardAdmin.html";
      }, 1500);
      // Tidak perlu setLoading(false) karena akan redirect
      return; 
    }
    // !!! AKHIR BAGIAN BERBAHAYA !!!

    try {
      const response = await fetch("https://back-end-eventory.vercel.app/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }), // Gunakan shorthand
      });

      const result = await response.json();
      console.log("Login response:", result);

      if (response.ok) { // Gunakan response.ok untuk mengecek status HTTP 2xx
        localStorage.setItem("token", result.token);
        // Pastikan result.data ada sebelum menyimpannya
        if (result.data) {
            localStorage.setItem("user", JSON.stringify(result.data));
        } else {
            console.warn("Data user tidak ditemukan dalam respons API.");
            // Simpan data minimal jika diperlukan
            localStorage.setItem("user", JSON.stringify({ email: email, role: false })); // Asumsi default role jika data tidak ada
        }
        
        const userData = result.data || {}; // Ambil data user, atau objek kosong jika tidak ada

        // Cek role dengan === (lebih aman)
        if (userData.role === true) {
          showMessage("Login berhasil! Mengalihkan ke halaman admin...", 'success');
          setTimeout(() => {
            window.location.href = window.location.origin + "/Frontend/page/admin/dashboardAdmin.html";
          }, 1500);
        } else {
          showMessage("Login berhasil! Mengalihkan ke halaman pengguna...", 'success');
          setTimeout(() => {
            window.location.href = window.location.origin + "/Frontend/page/user/dashboardUser.html";
          }, 1500);
        }
      } else {
        // Tampilkan pesan error dari API jika ada, atau pesan default
        showMessage(result.message || `Login gagal (${response.status}). Silakan coba lagi.`, 'error');
        setLoading(false); // Set loading false karena tidak redirect
      }
    } catch (error) {
      console.error("Login error:", error);
      showMessage("Terjadi kesalahan jaringan atau server. Silakan coba lagi nanti.", 'error');
      setLoading(false); // Set loading false karena error
    } 
    // Tidak perlu finally jika setLoading(false) sudah ditangani di path error
    // dan path success akan redirect. Tapi jika ingin_pasti_ kembali, gunakan finally.
    // Jika path sukses *tidak* redirect, Anda perlu setLoading(false) di sana atau di finally.
  }

  // --- Inisialisasi ---
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  } else {
    console.error("Form login (#login-form) tidak ditemukan!");
  }
  
  setupPasswordToggle();

}); // Akhir dari DOMContentLoaded