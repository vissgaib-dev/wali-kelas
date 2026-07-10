let siswa = JSON.parse(localStorage.getItem("dataSiswaKelas5")) || [];
let editIndex = null;

const menuItems = document.querySelectorAll(".menu a[data-page]");

menuItems.forEach(menu => {
  menu.addEventListener("click", function () {
    bukaHalaman(this.dataset.page);
  });
});

function bukaHalaman(id) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");

  menuItems.forEach(menu => {
    menu.classList.toggle("active", menu.dataset.page === id);
  });

  if (id === "siswa") tampilkanSiswa();
  if (id === "absensi") tampilkanAbsensi();
}

function bukaTambah() {
  editIndex = null;

  document.getElementById("judulModal").textContent = "Tambah Siswa";
  document.getElementById("formSiswa").reset();
  document.getElementById("modalSiswa").classList.add("active");
}

function tutupModal() {
  document.getElementById("modalSiswa").classList.remove("active");
}

document.getElementById("formSiswa").addEventListener("submit", function (e) {
  e.preventDefault();

  const data = {
    nama: document.getElementById("nama").value.trim(),
    jk: document.getElementById("jk").value,
    absen: Number(document.getElementById("absen").value)
  };

  if (editIndex === null) {
    siswa.push(data);
  } else {
    siswa[editIndex] = data;
  }

  siswa.sort((a, b) => a.absen - b.absen);

  simpanData();
  tutupModal();
  tampilkanSiswa();
});

function tampilkanSiswa() {
  const tbody = document.getElementById("tabelSiswa");
  const kata = document.getElementById("cariSiswa").value.toLowerCase();

  tbody.innerHTML = "";

  const hasil = siswa.filter(item =>
    item.nama.toLowerCase().includes(kata)
  );

  if (hasil.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty">
          Belum ada data siswa
        </td>
      </tr>
    `;
  } else {
    hasil.forEach(item => {
      const indexAsli = siswa.indexOf(item);

      tbody.innerHTML += `
        <tr>
          <td>${item.absen}</td>
          <td><strong>${item.nama}</strong></td>
          <td>${item.jk}</td>
          <td>${item.absen}</td>
          <td>
            <button
              class="btn btn-secondary btn-small"
              onclick="editSiswa(${indexAsli})">
              ✏️ Edit
            </button>

            <button
              class="btn btn-danger btn-small"
              onclick="hapusSiswa(${indexAsli})">
              🗑️ Hapus
            </button>
          </td>
        </tr>
      `;
    });
  }

  updateJumlah();
}

function editSiswa(index) {
  editIndex = index;

  document.getElementById("judulModal").textContent = "Edit Siswa";
  document.getElementById("nama").value = siswa[index].nama;
  document.getElementById("jk").value = siswa[index].jk;
  document.getElementById("absen").value = siswa[index].absen;

  document.getElementById("modalSiswa").classList.add("active");
}

function hapusSiswa(index) {
  if (confirm("Hapus data " + siswa[index].nama + "?")) {
    siswa.splice(index, 1);

    simpanData();
    tampilkanSiswa();
  }
}

function simpanData() {
  localStorage.setItem("dataSiswaKelas5", JSON.stringify(siswa));
  updateJumlah();
}

function updateJumlah() {
  document.getElementById("jumlahSiswa").textContent = siswa.length;
  document.getElementById("jumlahHeader").textContent =
    siswa.length + " Siswa";
}

document.getElementById("modalSiswa").addEventListener("click", function (e) {
  if (e.target === this) {
    tutupModal();
  }
});

updateJumlah();
tampilkanSiswa();


function tampilkanAbsensi() {
  const tbody = document.getElementById("tabelAbsensi");

  tbody.innerHTML = "";

  if (siswa.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="empty">
          Belum ada data siswa
        </td>
      </tr>
    `;
    return;
  }

  siswa.forEach(item => {
    tbody.innerHTML += `
      <tr>
        <td>${item.absen}</td>

        <td>
          <strong>${item.nama}</strong>
        </td>

        <td>
          <select class="status-absensi">
            <option value="Hadir">✅ Hadir</option>
            <option value="Sakit">🤒 Sakit</option>
            <option value="Izin">📄 Izin</option>
            <option value="Alpa">❌ Alpa</option>
          </select>
        </td>
      </tr>
    `;
  });
}
