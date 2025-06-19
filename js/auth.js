document.addEventListener('DOMContentLoaded', function () {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  // Fungsi untuk tampilkan pesan
  function showMessage(el, message, type) {
    el.textContent = message;
    el.className = `message ${type}`;
  }

  // Fungsi untuk toggle password visibility
  window.togglePassword = function (id, el) {
    const input = document.getElementById(id);
    if (input.type === 'password') {
      input.type = 'text';
      el.textContent = '🙈';
    } else {
      input.type = 'password';
      el.textContent = '👁️';
    }
  };

  // Register
  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('registerEmail').value.trim();
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const msg = document.getElementById('registerMsg');

      // Validasi email/nomor telepon
      const isEmail = /^\S+@\S+\.\S+$/.test(email);
      const isPhone = /^08\d{8,11}$/.test(email);
      if (!isEmail && !isPhone) {
        showMessage(msg, 'Gunakan email yang valid atau nomor HP yang benar.', 'error');
        return;
      }

      if (password.length < 6) {
        showMessage(msg, 'Password minimal 6 karakter.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showMessage(msg, 'Konfirmasi password tidak sesuai.', 'error');
        return;
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const exists = users.find(u => u.email === email || u.phone === email);
      if (exists) {
        showMessage(msg, 'Akun sudah terdaftar.', 'error');
        return;
      }

      users.push({ email, phone: email, password });
      localStorage.setItem('users', JSON.stringify(users));
      showMessage(msg, 'Akun berhasil didaftarkan! Silakan login.', 'success');
      setTimeout(() => window.location.href = 'login.html', 1500);
    });
  }

  // Login
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const msg = document.getElementById('loginMsg');

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => (u.email === email || u.phone === email) && u.password === password);

      if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        showMessage(msg, 'Login berhasil! Mengalihkan...', 'success');
        setTimeout(() => window.location.href = 'index.html', 1000);
      } else {
        showMessage(msg, 'Email/No.Telp atau password salah.', 'error');
      }
    });
  }
});

// Fungsi menilai kekuatan password
function checkPasswordStrength(password) {
  const strengthBox = document.getElementById('passwordStrength');
  let strength = '';
  let score = 0;

  if (password.length >= 6) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) {
    strength = 'Lemah';
    strengthBox.className = 'helper-text weak';
  } else if (score === 2 || score === 3) {
    strength = 'Sedang';
    strengthBox.className = 'helper-text medium';
  } else {
    strength = 'Kuat';
    strengthBox.className = 'helper-text strong';
  }

  strengthBox.textContent = `Kekuatan Password: ${strength}`;
}

// Pasang listener kekuatan password
document.addEventListener('DOMContentLoaded', function () {
  const passwordInput = document.getElementById('registerPassword');
  if (passwordInput) {
    passwordInput.addEventListener('input', function () {
      checkPasswordStrength(this.value);
    });
  }
});
