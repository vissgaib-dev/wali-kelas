const K={siswa:"dataSiswaKelas5",absensi:"absensiKelas5",jurnal:"jurnalKelas5",catatan:"catatanKelas5",nilai:"nilaiKelas5",setting:"settingKelas5",mapel:"mapelKelas5",tabungan:"tabunganKelas5"};
let siswa=baca(K.siswa,[]),absensi=baca(K.absensi,{}),jurnal=baca(K.jurnal,[]),catatan=baca(K.catatan,[]),nilai=baca(K.nilai,[]),mapel=baca(K.mapel,["Bahasa Indonesia","Matematika","IPAS","Pendidikan Pancasila"]),tabungan=baca(K.tabungan,[]),setting=baca(K.setting,{wali:"Wali Kelas 5",kelas:"Kelas 5",sekolah:"",tahun:"2026/2027"}),editIndex=null;
const $=id=>document.getElementById(id), hariIni=()=>new Date().toISOString().slice(0,10);
function baca(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}
function tulis(k,v){localStorage.setItem(k,JSON.stringify(v))}
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2200)}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

const menuItems=document.querySelectorAll(".menu a[data-page]");
menuItems.forEach(m=>m.onclick=()=>bukaHalaman(m.dataset.page));
function bukaHalaman(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  $(id).classList.add("active");
  menuItems.forEach(m=>m.classList.toggle("active",m.dataset.page===id));
  $("sidebar").classList.remove("open");
  if(id==="siswa")tampilkanSiswa();
  if(id==="absensi")tampilkanAbsensi();
  if(id==="rekap")tampilkanRekap();
  if(id==="jurnal")tampilkanJurnal();
  if(id==="catatan")tampilkanCatatan();
  if(id==="nilai")tampilkanNilai();
  if(id==="mapel")tampilkanMapel();
  if(id==="tabungan")tampilkanTabungan();
}
$("mobileToggle").onclick=()=>$("sidebar").classList.toggle("open");

function bukaTambah(){editIndex=null;$("judulModal").textContent="Tambah Siswa";$("formSiswa").reset();$("modalSiswa").classList.add("active")}
function tutupModal(){$("modalSiswa").classList.remove("active")}
$("modalSiswa").onclick=e=>{if(e.target===$("modalSiswa"))tutupModal()};
$("formSiswa").onsubmit=e=>{
  e.preventDefault();
  const data={nama:$("nama").value.trim(),jk:$("jk").value,absen:Number($("absen").value)};
  if(!data.nama)return;
  const bentrok=siswa.some((x,i)=>x.absen===data.absen&&i!==editIndex);
  if(bentrok)return alert("Nomor absen sudah dipakai.");
  editIndex===null?siswa.push(data):siswa[editIndex]=data;
  siswa.sort((a,b)=>a.absen-b.absen);tulis(K.siswa,siswa);tutupModal();tampilkanSiswa();isiPilihanSiswa();updateDashboard();toast("Data siswa tersimpan");
};
$("cariSiswa").oninput=tampilkanSiswa;
function tampilkanSiswa(){
  const kata=$("cariSiswa").value.toLowerCase(),hasil=siswa.filter(x=>x.nama.toLowerCase().includes(kata));
  $("tabelSiswa").innerHTML=hasil.length?hasil.map(x=>{const i=siswa.indexOf(x);return `<tr><td>${x.absen}</td><td><strong>${esc(x.nama)}</strong></td><td>${esc(x.jk)}</td><td>${x.absen}</td><td><button class="btn btn-secondary btn-small" onclick="editSiswa(${i})">✏️ Edit</button> <button class="btn btn-danger btn-small" onclick="hapusSiswa(${i})">🗑️ Hapus</button></td></tr>`}).join(""):`<tr><td colspan="5" class="empty">Belum ada data siswa</td></tr>`;
  updateJumlah();
}
function editSiswa(i){editIndex=i;$("judulModal").textContent="Edit Siswa";$("nama").value=siswa[i].nama;$("jk").value=siswa[i].jk;$("absen").value=siswa[i].absen;$("modalSiswa").classList.add("active")}
function hapusSiswa(i){if(confirm(`Hapus data ${siswa[i].nama}?`)){siswa.splice(i,1);tulis(K.siswa,siswa);tampilkanSiswa();isiPilihanSiswa();updateDashboard()}}
function updateJumlah(){$("jumlahSiswa").textContent=siswa.length;$("jumlahHeader").textContent=`${siswa.length} Siswa`}

$("tanggalAbsensi").value=hariIni();$("tanggalAbsensi").onchange=tampilkanAbsensi;
function tampilkanAbsensi(){
  const t=$("tanggalAbsensi").value||hariIni();$("tanggalHariIni").textContent=new Date(t+"T00:00:00").toLocaleDateString("id-ID",{day:"2-digit",month:"long",year:"numeric"});
  const data=absensi[t]||{};
  $("tabelAbsensi").innerHTML=siswa.length?siswa.map(x=>`<tr><td>${x.absen}</td><td><strong>${esc(x.nama)}</strong></td><td><select class="status-absensi" data-absen="${x.absen}">${["Hadir","Sakit","Izin","Alpa"].map(v=>`<option value="${v}" ${(data[x.absen]||"Hadir")===v?"selected":""}>${{Hadir:"✅",Sakit:"🤒",Izin:"📄",Alpa:"❌"}[v]} ${v}</option>`).join("")}</select></td></tr>`).join(""):`<tr><td colspan="3" class="empty">Belum ada data siswa</td></tr>`;
}
function hadirSemua(){document.querySelectorAll(".status-absensi").forEach(s=>s.value="Hadir")}
function simpanAbsensi(){
  const t=$("tanggalAbsensi").value;if(!t)return alert("Pilih tanggal.");
  const data={};document.querySelectorAll(".status-absensi").forEach(s=>data[s.dataset.absen]=s.value);
  absensi[t]=data;tulis(K.absensi,absensi);updateDashboard();toast("Absensi tersimpan");
}

$("bulanRekap").value=hariIni().slice(0,7);
function tampilkanRekap(){
  const bln=$("bulanRekap").value||hariIni().slice(0,7);
  $("tabelRekap").innerHTML=siswa.length?siswa.map(x=>{const r={Hadir:0,Sakit:0,Izin:0,Alpa:0};Object.entries(absensi).filter(([t])=>t.startsWith(bln)).forEach(([,d])=>{const s=d[x.absen];if(r[s]!==undefined)r[s]++});const total=Object.values(r).reduce((a,b)=>a+b,0);return `<tr><td>${x.absen}</td><td><strong>${esc(x.nama)}</strong></td><td>${r.Hadir}</td><td>${r.Sakit}</td><td>${r.Izin}</td><td>${r.Alpa}</td><td>${total}</td></tr>`}).join(""):`<tr><td colspan="7" class="empty">Belum ada data siswa</td></tr>`;
}

$("jurnalTanggal").value=hariIni();
$("formJurnal").onsubmit=e=>{e.preventDefault();jurnal.unshift({tanggal:$("jurnalTanggal").value,mapel:$("jurnalMapel").value.trim(),materi:$("jurnalMateri").value.trim()});tulis(K.jurnal,jurnal);e.target.reset();$("jurnalTanggal").value=hariIni();tampilkanJurnal();toast("Jurnal tersimpan")};
function tampilkanJurnal(){$("tabelJurnal").innerHTML=jurnal.length?jurnal.map((x,i)=>`<tr><td>${x.tanggal}</td><td>${esc(x.mapel)}</td><td>${esc(x.materi)}</td><td><button class="btn btn-danger btn-small" onclick="hapusItem('jurnal',${i})">🗑️</button></td></tr>`).join(""):`<tr><td colspan="4" class="empty">Belum ada jurnal</td></tr>`}

$("catatanTanggal").value=hariIni();
$("formCatatan").onsubmit=e=>{e.preventDefault();catatan.unshift({tanggal:$("catatanTanggal").value,absen:Number($("catatanSiswa").value),isi:$("isiCatatan").value.trim()});tulis(K.catatan,catatan);e.target.reset();$("catatanTanggal").value=hariIni();isiPilihanSiswa();tampilkanCatatan();toast("Catatan tersimpan")};
function tampilkanCatatan(){$("tabelCatatan").innerHTML=catatan.length?catatan.map((x,i)=>{const s=siswa.find(a=>a.absen===x.absen);return `<tr><td>${x.tanggal}</td><td>${esc(s?.nama||"Siswa dihapus")}</td><td>${esc(x.isi)}</td><td><button class="btn btn-danger btn-small" onclick="hapusItem('catatan',${i})">🗑️</button></td></tr>`}).join(""):`<tr><td colspan="4" class="empty">Belum ada catatan</td></tr>`}

$("formNilai").onsubmit=e=>{e.preventDefault();nilai.unshift({absen:Number($("nilaiSiswa").value),mapel:$("nilaiMapel").value,jenis:$("nilaiJenis").value.trim(),angka:Number($("nilaiAngka").value)});tulis(K.nilai,nilai);e.target.reset();isiPilihanSiswa();tampilkanNilai();toast("Nilai tersimpan")};
function tampilkanNilai(){$("tabelNilai").innerHTML=nilai.length?nilai.map((x,i)=>{const s=siswa.find(a=>a.absen===x.absen);return `<tr><td>${esc(s?.nama||"Siswa dihapus")}</td><td>${esc(x.mapel)}</td><td>${esc(x.jenis)}</td><td><strong>${x.angka}</strong></td><td><button class="btn btn-danger btn-small" onclick="hapusItem('nilai',${i})">🗑️</button></td></tr>`}).join(""):`<tr><td colspan="5" class="empty">Belum ada nilai</td></tr>`}

function isiPilihanMapel(){const opsi=`<option value="">Pilih mata pelajaran</option>`+mapel.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join("");$("nilaiMapel").innerHTML=opsi}
function tampilkanMapel(){$("tabelMapel").innerHTML=mapel.length?mapel.map((x,i)=>`<tr><td>${i+1}</td><td><strong>${esc(x)}</strong></td><td><button class="btn btn-danger btn-small" onclick="hapusMapel(${i})">🗑️ Hapus</button></td></tr>`).join(""):`<tr><td colspan="3" class="empty">Belum ada mata pelajaran</td></tr>`}
$("formMapel").onsubmit=e=>{e.preventDefault();const n=$("namaMapel").value.trim();if(n&&!mapel.some(x=>x.toLowerCase()===n.toLowerCase())){mapel.push(n);mapel.sort();tulis(K.mapel,mapel);tampilkanMapel();isiPilihanMapel();e.target.reset();toast("Mata pelajaran ditambahkan")}}
function hapusMapel(i){if(confirm("Hapus mata pelajaran ini?")){mapel.splice(i,1);tulis(K.mapel,mapel);tampilkanMapel();isiPilihanMapel()}}

$("tabTanggal").value=hariIni();$("bulanTabungan").value=hariIni().slice(0,7);
$("formTabungan").onsubmit=e=>{e.preventDefault();tabungan.unshift({tanggal:$("tabTanggal").value,absen:Number($("tabSiswa").value),nominal:Number($("tabNominal").value),ket:$("tabKet").value.trim()});tulis(K.tabungan,tabungan);e.target.reset();$("tabTanggal").value=hariIni();isiPilihanSiswa();tampilkanTabungan();updateDashboard();toast("Setoran tersimpan")}
function rupiah(n){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n||0)}
function tampilkanTabungan(){const bln=$("bulanTabungan").value||hariIni().slice(0,7),data=tabungan.filter(x=>x.tanggal.startsWith(bln));$("tabelTabungan").innerHTML=data.length?data.map(x=>{const i=tabungan.indexOf(x),s=siswa.find(a=>a.absen===x.absen);return `<tr><td>${x.tanggal}</td><td>${esc(s?.nama||"Siswa dihapus")}</td><td>${rupiah(x.nominal)}</td><td>${esc(x.ket)}</td><td><button class="btn btn-danger btn-small" onclick="hapusTabungan(${i})">🗑️</button></td></tr>`}).join(""):`<tr><td colspan="5" class="empty">Belum ada setoran bulan ini</td></tr>`;$("rekapTabungan").innerHTML=siswa.map(s=>{const bulan=data.filter(x=>x.absen===s.absen).reduce((a,b)=>a+b.nominal,0),total=tabungan.filter(x=>x.absen===s.absen).reduce((a,b)=>a+b.nominal,0);return `<tr><td>${s.absen}</td><td><strong>${esc(s.nama)}</strong></td><td>${rupiah(bulan)}</td><td>${rupiah(total)}</td></tr>`}).join("");const total=tabungan.reduce((a,b)=>a+b.nominal,0);$("saldoKelas").textContent=rupiah(total)}
function hapusTabungan(i){if(confirm("Hapus setoran ini?")){tabungan.splice(i,1);tulis(K.tabungan,tabungan);tampilkanTabungan();updateDashboard()}}

function prosesKodeAbsensi(){const kode=$("kodeScan").value.trim();const no=Number(kode.replace(/\D/g,""));const s=siswa.find(x=>x.absen===no);if(!s){$("hasilScan").textContent="❌ Kode siswa tidak ditemukan";return}const t=hariIni();absensi[t]=absensi[t]||{};if(absensi[t][s.absen]==="Hadir"){$("hasilScan").textContent=`⚠️ ${s.nama} sudah tercatat hadir`;return}absensi[t][s.absen]="Hadir";tulis(K.absensi,absensi);$("hasilScan").textContent=`✅ ${s.nama} berhasil dicatat hadir`;updateDashboard();$("kodeScan").value=""}

function isiPilihanSiswa(){const opsi=`<option value="">Pilih siswa</option>`+siswa.map(x=>`<option value="${x.absen}">${x.absen}. ${esc(x.nama)}</option>`).join("");$("catatanSiswa").innerHTML=opsi;$("nilaiSiswa").innerHTML=opsi;$("tabSiswa").innerHTML=opsi}
function hapusItem(jenis,i){if(!confirm("Hapus data ini?"))return;if(jenis==="jurnal"){jurnal.splice(i,1);tulis(K.jurnal,jurnal);tampilkanJurnal()}if(jenis==="catatan"){catatan.splice(i,1);tulis(K.catatan,catatan);tampilkanCatatan()}if(jenis==="nilai"){nilai.splice(i,1);tulis(K.nilai,nilai);tampilkanNilai()}}

function muatPengaturan(){$("settingWali").value=setting.wali;$("settingKelas").value=setting.kelas;$("settingSekolah").value=setting.sekolah;$("settingTahun").value=setting.tahun;terapkanPengaturan()}
$("formPengaturan").onsubmit=e=>{e.preventDefault();setting={wali:$("settingWali").value.trim()||"Wali Kelas 5",kelas:$("settingKelas").value.trim()||"Kelas 5",sekolah:$("settingSekolah").value.trim(),tahun:$("settingTahun").value.trim()};tulis(K.setting,setting);terapkanPengaturan();toast("Pengaturan tersimpan")};
function terapkanPengaturan(){$("namaWaliHeader").textContent=setting.wali;$("subJudulDashboard").textContent=`${setting.sekolah?setting.sekolah+" • ":""}${setting.kelas} • ${setting.tahun}`}

function updateDashboard(){updateJumlah();const d=absensi[hariIni()]||{},v=Object.values(d);$("hadirHariIni").textContent=v.filter(x=>x==="Hadir").length;$("izinHariIni").textContent=v.filter(x=>x==="Sakit"||x==="Izin").length;$("alpaHariIni").textContent=v.filter(x=>x==="Alpa").length;const total=tabungan.reduce((a,b)=>a+b.nominal,0),bln=hariIni().slice(0,7),bulan=tabungan.filter(x=>x.tanggal.startsWith(bln)).reduce((a,b)=>a+b.nominal,0);$("totalTabunganKelas").textContent=rupiah(total);$("tabunganBulanIni").textContent=rupiah(bulan)}
function cetakBagian(id){bukaHalaman(id);document.querySelectorAll(".page").forEach(p=>p.classList.remove("printing"));$(id).classList.add("printing");setTimeout(()=>{window.print();$(id).classList.remove("printing")},150)}
function eksporData(){const data={versi:1,tanggal:hariIni(),siswa,absensi,jurnal,catatan,nilai,mapel,tabungan,setting};const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`cadangan-wali-kelas-${hariIni()}.json`;a.click();URL.revokeObjectURL(a.href)}
$("fileImpor").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!confirm("Impor akan mengganti data aplikasi saat ini. Lanjut?"))return;siswa=d.siswa||[];absensi=d.absensi||{};jurnal=d.jurnal||[];catatan=d.catatan||[];nilai=d.nilai||[];mapel=d.mapel||mapel;tabungan=d.tabungan||[];setting=d.setting||setting;tulis(K.siswa,siswa);tulis(K.absensi,absensi);tulis(K.jurnal,jurnal);tulis(K.catatan,catatan);tulis(K.nilai,nilai);tulis(K.mapel,mapel);tulis(K.tabungan,tabungan);tulis(K.setting,setting);location.reload()}catch{alert("File cadangan tidak valid.")}};r.readAsText(f)};

tampilkanSiswa();tampilkanAbsensi();tampilkanRekap();tampilkanJurnal();tampilkanCatatan();tampilkanNilai();tampilkanMapel();tampilkanTabungan();isiPilihanSiswa();isiPilihanMapel();muatPengaturan();updateDashboard();
