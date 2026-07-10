const K={siswa:"dataSiswaKelas5",absensi:"absensiKelas5",tabungan:"tabunganKelas5",mapel:"mapelKelas5",nilai:"nilaiKelas5",jurnal:"jurnalKelas5",catatan:"catatanKelas5",setting:"settingKelas5"};
const $=id=>document.getElementById(id),today=()=>new Date().toISOString().slice(0,10),read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
let siswa=read(K.siswa,[]),absensi=read(K.absensi,{}),tabungan=read(K.tabungan,[]).map(x=>({
  ...x,
  jenis:x.jenis||"Setoran",
  nominal:Number(x.nominal||0)
})),mapel=read(K.mapel,["Bahasa Indonesia","Matematika","IPAS","Pendidikan Pancasila"]),nilai=read(K.nilai,[]),jurnal=read(K.jurnal,[]),catatan=read(K.catatan,[]),setting=read(K.setting,{wali:"Wali Kelas 5",kelas:"Kelas 5",sekolah:"",tahun:"2026/2027"}),editIndex=null;
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])),rp=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n||0);
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2200)}
document.querySelectorAll(".menu a").forEach(a=>a.onclick=()=>bukaHalaman(a.dataset.page));
$("mobileToggle").onclick=()=>$("sidebar").classList.toggle("open");
function bukaHalaman(id){document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));$(id).classList.add("active");document.querySelectorAll(".menu a").forEach(a=>a.classList.toggle("active",a.dataset.page===id));$("sidebar").classList.remove("open");if(id==="siswa")renderSiswa();if(id==="absensi")renderAbsensi();if(id==="rekap")tampilkanRekap();if(id==="tabungan")tampilkanTabungan();if(id==="mapel")renderMapel();if(id==="nilai")renderNilai();if(id==="jurnal")renderJurnal();if(id==="catatan")renderCatatan()}
function fokusTabungan(){setTimeout(()=>$("tabSiswa").focus(),100)}
function optionsSiswa(semua=false){return (semua?'<option value="">Semua / Pilih siswa</option>':'<option value="">Pilih siswa</option>')+siswa.map(s=>`<option value="${s.absen}">${s.absen}. ${esc(s.nama)}</option>`).join("")}
function optionsMapel(semua=false){return (semua?'<option value="">Semua / Pilih mapel</option>':'<option value="">Pilih mapel</option>')+mapel.map(m=>`<option value="${esc(m)}">${esc(m)}</option>`).join("")}
function refreshOptions(){$("tabSiswa").innerHTML=optionsSiswa();$("tarikSiswa").innerHTML=optionsSiswa();$("nilaiSiswa").innerHTML=optionsSiswa();$("catatanSiswa").innerHTML=optionsSiswa();$("rekapNilaiSiswa").innerHTML=optionsSiswa(true);$("nilaiMapel").innerHTML=optionsMapel();$("jurnalMapel").innerHTML=optionsMapel();$("rekapNilaiMapel").innerHTML=optionsMapel(true)}
function bukaTambah(){editIndex=null;$("judulModal").textContent="Tambah Siswa";$("formSiswa").reset();$("modalSiswa").classList.add("active")}function tutupModal(){$("modalSiswa").classList.remove("active")}
$("formSiswa").onsubmit=e=>{e.preventDefault();const d={nama:$("nama").value.trim(),jk:$("jk").value,absen:Number($("absen").value),kode:$("kodeKartu").value.trim()||`KLS5-${String($("absen").value).padStart(3,"0")}`};if(siswa.some((x,i)=>x.absen===d.absen&&i!==editIndex))return alert("Nomor absen sudah dipakai.");editIndex===null?siswa.push(d):siswa[editIndex]=d;siswa.sort((a,b)=>a.absen-b.absen);write(K.siswa,siswa);tutupModal();renderSiswa();refreshOptions();dashboard();toast("Data siswa tersimpan")};
$("cariSiswa").oninput=renderSiswa;
function renderSiswa(){const q=$("cariSiswa").value.toLowerCase(),d=siswa.filter(s=>s.nama.toLowerCase().includes(q));$("tabelSiswa").innerHTML=d.length?d.map(s=>{const i=siswa.indexOf(s);return `<tr><td>${s.absen}</td><td><b>${esc(s.nama)}</b></td><td>${esc(s.jk)}</td><td>${esc(s.kode||`KLS5-${String(s.absen).padStart(3,"0")}`)}</td><td><button class="btn secondary small" onclick="editSiswa(${i})">✏️</button> <button class="btn danger small" onclick="hapusSiswa(${i})">🗑️</button></td></tr>`}).join(""):`<tr><td colspan="5">Belum ada siswa</td></tr>`;$("jumlahHeader").textContent=`${siswa.length} Siswa`}
function editSiswa(i){editIndex=i;const s=siswa[i];$("judulModal").textContent="Edit Siswa";$("nama").value=s.nama;$("jk").value=s.jk;$("absen").value=s.absen;$("kodeKartu").value=s.kode||"";$("modalSiswa").classList.add("active")}
function hapusSiswa(i){if(confirm(`Hapus ${siswa[i].nama}?`)){siswa.splice(i,1);write(K.siswa,siswa);renderSiswa();refreshOptions();dashboard()}}

$("tanggalAbsensi").value=today();$("tanggalAbsensi").onchange=renderAbsensi;
function renderAbsensi(){const t=$("tanggalAbsensi").value||today(),d=absensi[t]||{};$("tanggalHariIni").textContent=new Date(t+"T00:00:00").toLocaleDateString("id-ID",{day:"2-digit",month:"long",year:"numeric"});$("tabelAbsensi").innerHTML=siswa.map(s=>`<tr><td>${s.absen}</td><td><b>${esc(s.nama)}</b></td><td><select class="status" data-absen="${s.absen}">${["Hadir","Sakit","Izin","Alpa"].map(v=>`<option ${(d[s.absen]||"Hadir")===v?"selected":""}>${v}</option>`).join("")}</select></td></tr>`).join("")}
function hadirSemua(){document.querySelectorAll(".status").forEach(x=>x.value="Hadir")}
function simpanAbsensi(){const t=$("tanggalAbsensi").value,d={};document.querySelectorAll(".status").forEach(x=>d[x.dataset.absen]=x.value);absensi[t]=d;write(K.absensi,absensi);dashboard();toast("Absensi tersimpan")}
$("bulanRekap").value=today().slice(0,7);
function tampilkanRekap(){const b=$("bulanRekap").value;$("tabelRekap").innerHTML=siswa.map(s=>{let r={Hadir:0,Sakit:0,Izin:0,Alpa:0};Object.entries(absensi).filter(([t])=>t.startsWith(b)).forEach(([,d])=>{if(r[d[s.absen]]!==undefined)r[d[s.absen]]++});return `<tr><td>${s.absen}</td><td><b>${esc(s.nama)}</b></td><td>${r.Hadir}</td><td>${r.Sakit}</td><td>${r.Izin}</td><td>${r.Alpa}</td><td>${Object.values(r).reduce((a,c)=>a+c,0)}</td></tr>`}).join("")}
function prosesKodeAbsensi(){const k=$("kodeScan").value.trim(),s=siswa.find(x=>(x.kode||`KLS5-${String(x.absen).padStart(3,"0")}`)===k);if(!s){$("hasilScan").textContent="❌ Kode tidak ditemukan";return}absensi[today()]=absensi[today()]||{};if(absensi[today()][s.absen]==="Hadir"){$("hasilScan").textContent=`⚠️ ${s.nama} sudah hadir`;return}absensi[today()][s.absen]="Hadir";write(K.absensi,absensi);$("hasilScan").textContent=`✅ ${s.nama} berhasil hadir`;$("kodeScan").value="";dashboard()}

$("tabTanggal").value=today();$("tarikTanggal").value=today();$("tanggalSetoranMassal").value=today();$("tanggalRekapHarian").value=today();$("kegiatanTanggal").value=today();$("bulanTabungan").value=today().slice(0,7);

function saldoSiswa(absen){
  return tabungan.filter(x=>x.absen===absen).reduce((a,x)=>a+(x.jenis==="Setoran"?x.nominal:-x.nominal),0);
}
function renderSetoranMassal(){
  const t=$("tanggalSetoranMassal").value||today();
  $("tabelSetoranMassal").innerHTML=siswa.map(s=>{
    const lama=tabungan.filter(x=>x.tanggal===t&&x.absen===s.absen&&x.jenis==="Setoran"&&x.sumber==="Massal").reduce((a,x)=>a+x.nominal,0);
    return `<tr><td>${s.absen}</td><td><b>${esc(s.nama)}</b></td><td><input class="money-input setoran-massal" data-absen="${s.absen}" type="number" min="0" placeholder="Kosong = tidak setor" value="${lama||""}"></td><td class="status-setor ${lama?"status-ok":"status-no"}">${lama?"Sudah Setor":"Belum Setor"}</td></tr>`;
  }).join("");
}
$("tanggalSetoranMassal").onchange=()=>{renderSetoranMassal();$("tanggalRekapHarian").value=$("tanggalSetoranMassal").value;tampilkanRekapHarian()};

function simpanSetoranMassal(){
  const t=$("tanggalSetoranMassal").value;
  if(!t)return alert("Pilih tanggal.");
  const inputs=[...document.querySelectorAll(".setoran-massal")];
  tabungan=tabungan.filter(x=>!(x.tanggal===t&&x.jenis==="Setoran"&&x.sumber==="Massal"));
  let jumlah=0,total=0;
  inputs.forEach(i=>{
    const n=Number(i.value||0);
    if(n>0){tabungan.unshift({tanggal:t,absen:Number(i.dataset.absen),jenis:"Setoran",nominal:n,ket:"Setoran harian",sumber:"Massal"});jumlah++;total+=n}
  });
  write(K.tabungan,tabungan);
  $("tanggalRekapHarian").value=t;
  tampilkanTabungan();renderSetoranMassal();tampilkanRekapHarian();renderKegiatanMassal();dashboard();
  toast(`${jumlah} setoran tersimpan • ${rp(total)}`);
}

function tampilkanRekapHarian(){
  const t=$("tanggalRekapHarian").value||today();
  let setor=0,total=0;
  $("tabelRekapHarian").innerHTML=siswa.map(s=>{
    const n=tabungan.filter(x=>x.tanggal===t&&x.absen===s.absen&&x.jenis==="Setoran").reduce((a,x)=>a+x.nominal,0);
    if(n>0){setor++;total+=n}
    return `<tr><td>${s.absen}</td><td><b>${esc(s.nama)}</b></td><td>${n?rp(n):"-"}</td><td class="${n?"status-ok":"status-no"}"><b>${n?"Sudah Setor":"Belum Setor"}</b></td></tr>`;
  }).join("");
  $("jumlahSetorHari").textContent=setor;
  $("jumlahBelumHari").textContent=Math.max(0,siswa.length-setor);
  $("totalMasukHari").textContent=rp(total);
}

$("formTabungan").onsubmit=e=>{
  e.preventDefault();
  tabungan.unshift({tanggal:$("tabTanggal").value,absen:Number($("tabSiswa").value),jenis:"Setoran",nominal:Number($("tabNominal").value),ket:$("tabKet").value.trim()||"Setoran susulan",sumber:"Satuan"});
  write(K.tabungan,tabungan);e.target.reset();$("tabTanggal").value=today();refreshOptions();tampilkanTabungan();renderSetoranMassal();tampilkanRekapHarian();renderKegiatanMassal();dashboard();toast("Setoran tersimpan")
};

$("formPenarikan").onsubmit=e=>{
  e.preventDefault();
  const absen=Number($("tarikSiswa").value),nominal=Number($("tarikNominal").value);
  if(nominal>saldoSiswa(absen))return alert(`Saldo tidak cukup. Saldo saat ini ${rp(saldoSiswa(absen))}.`);
  tabungan.unshift({tanggal:$("tarikTanggal").value,absen,jenis:"Penarikan",nominal,pengambil:$("tarikPengambil").value.trim(),ket:$("tarikKet").value.trim(),sumber:"Penarikan"});
  write(K.tabungan,tabungan);e.target.reset();$("tarikTanggal").value=today();refreshOptions();tampilkanTabungan();renderKegiatanMassal();dashboard();toast("Penarikan tersimpan")
};

function renderKegiatanMassal(){
  $("tabelKegiatanMassal").innerHTML=siswa.map(s=>`<tr><td><input class="pilih-kegiatan" data-absen="${s.absen}" type="checkbox"></td><td>${s.absen}</td><td><b>${esc(s.nama)}</b></td><td>${rp(saldoSiswa(s.absen))}</td></tr>`).join("");
}
function pilihSemuaKegiatan(v){document.querySelectorAll(".pilih-kegiatan").forEach(x=>x.checked=v)}
function simpanKegiatanMassal(){
  const tanggal=$("kegiatanTanggal").value,nama=$("kegiatanNama").value.trim(),nominal=Number($("kegiatanNominal").value),ket=$("kegiatanKet").value.trim();
  const dipilih=[...document.querySelectorAll(".pilih-kegiatan:checked")].map(x=>Number(x.dataset.absen));
  if(!tanggal||!nama||nominal<=0||!dipilih.length)return alert("Lengkapi tanggal, nama kegiatan, nominal, dan pilih siswa.");
  const kurang=dipilih.filter(a=>saldoSiswa(a)<nominal);
  if(kurang.length){const names=kurang.map(a=>siswa.find(s=>s.absen===a)?.nama).join(", ");return alert(`Saldo tidak cukup: ${names}`)}
  if(!confirm(`Kurangi ${rp(nominal)} dari ${dipilih.length} siswa untuk kegiatan "${nama}"?`))return;
  dipilih.forEach(absen=>tabungan.unshift({tanggal,absen,jenis:"Kegiatan",nominal,namaKegiatan:nama,ket:ket||nama,sumber:"Kegiatan Massal"}));
  write(K.tabungan,tabungan);tampilkanTabungan();renderKegiatanMassal();dashboard();toast("Pengeluaran kegiatan tersimpan")
}

function tampilkanTabungan(){
  const b=$("bulanTabungan").value||today().slice(0,7),filter=$("filterJenis").value;
  const d=tabungan.filter(x=>x.tanggal.startsWith(b)&&(!filter||x.jenis===filter));
  $("tabelTabungan").innerHTML=d.length?d.map(x=>{
    const i=tabungan.indexOf(x),s=siswa.find(a=>a.absen===x.absen),masuk=x.jenis==="Setoran"?x.nominal:0,keluar=x.jenis==="Setoran"?0:x.nominal;
    const ket=x.jenis==="Penarikan"?`${x.ket||"Penarikan"} • Pengambil: ${x.pengambil||"-"}`:x.jenis==="Kegiatan"?`${x.namaKegiatan||"Kegiatan"}${x.ket?` • ${x.ket}`:""}`:x.ket||"Setoran";
    return `<tr><td>${x.tanggal}</td><td>${esc(s?.nama||"Siswa dihapus")}</td><td><b>${esc(x.jenis)}</b></td><td>${masuk?rp(masuk):"-"}</td><td>${keluar?rp(keluar):"-"}</td><td>${esc(ket)}</td><td><button class="btn danger small" onclick="hapusTab(${i})">🗑️</button></td></tr>`
  }).join(""):`<tr><td colspan="7">Belum ada transaksi bulan ini</td></tr>`;

  $("rekapTabungan").innerHTML=siswa.map(s=>{
    const all=tabungan.filter(x=>x.absen===s.absen),bulan=all.filter(x=>x.tanggal.startsWith(b));
    const bm=bulan.filter(x=>x.jenis==="Setoran").reduce((a,x)=>a+x.nominal,0),bk=bulan.filter(x=>x.jenis!=="Setoran").reduce((a,x)=>a+x.nominal,0);
    const tm=all.filter(x=>x.jenis==="Setoran").reduce((a,x)=>a+x.nominal,0),tk=all.filter(x=>x.jenis!=="Setoran").reduce((a,x)=>a+x.nominal,0);
    return `<tr><td>${s.absen}</td><td><b>${esc(s.nama)}</b></td><td>${rp(bm)}</td><td>${rp(bk)}</td><td><b>${rp(bm-bk)}</b></td><td>${rp(tm)}</td><td>${rp(tk)}</td><td><b>${rp(tm-tk)}</b></td></tr>`
  }).join("");

  const masuk=tabungan.filter(x=>x.jenis==="Setoran").reduce((a,x)=>a+x.nominal,0),keluar=tabungan.filter(x=>x.jenis!=="Setoran").reduce((a,x)=>a+x.nominal,0);
  $("totalSetoran").textContent=rp(masuk);$("totalKeluar").textContent=rp(keluar);$("saldoTabungan").textContent=rp(masuk-keluar);$("saldoKelas").textContent=rp(masuk-keluar);
}
function hapusTab(i){if(confirm("Hapus transaksi ini?")){tabungan.splice(i,1);write(K.tabungan,tabungan);tampilkanTabungan();renderSetoranMassal();tampilkanRekapHarian();renderKegiatanMassal();dashboard()}}

$("formMapel").onsubmit=e=>{e.preventDefault();const n=$("namaMapel").value.trim();if(n&&!mapel.some(x=>x.toLowerCase()===n.toLowerCase())){mapel.push(n);mapel.sort();write(K.mapel,mapel);renderMapel();refreshOptions();e.target.reset();toast("Mapel ditambahkan")}};
function renderMapel(){$("tabelMapel").innerHTML=mapel.map((m,i)=>`<tr><td>${i+1}</td><td><b>${esc(m)}</b></td><td><button class="btn danger small" onclick="hapusMapel(${i})">🗑️</button></td></tr>`).join("")}
function hapusMapel(i){if(confirm("Hapus mapel?")){mapel.splice(i,1);write(K.mapel,mapel);renderMapel();refreshOptions()}}

$("formNilai").onsubmit=e=>{e.preventDefault();nilai.unshift({semester:$("nilaiSemester").value,absen:Number($("nilaiSiswa").value),mapel:$("nilaiMapel").value,jenis:$("nilaiJenis").value,kegiatan:$("nilaiKegiatan").value.trim(),angka:Number($("nilaiAngka").value)});write(K.nilai,nilai);e.target.reset();refreshOptions();renderNilai();toast("Nilai tersimpan")};
function renderNilai(){$("tabelNilai").innerHTML=nilai.length?nilai.map((n,i)=>{const s=siswa.find(x=>x.absen===n.absen);return `<tr><td>${n.semester||1}</td><td>${esc(s?.nama||"Siswa dihapus")}</td><td>${esc(n.mapel)}</td><td>${esc(n.jenis)}</td><td>${esc(n.kegiatan||"")}</td><td><b>${n.angka}</b></td><td><button class="btn danger small" onclick="hapusNilai(${i})">🗑️</button></td></tr>`}).join(""):`<tr><td colspan="7">Belum ada nilai</td></tr>`}
function hapusNilai(i){if(confirm("Hapus nilai?")){nilai.splice(i,1);write(K.nilai,nilai);renderNilai()}}
const avg=a=>a.length?(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1):"-";
function kelompokJenis(d){const jenis=["Tugas / Formatif","Ulangan Harian / Sumatif Lingkup Materi","Tengah Semester","Akhir Semester"];return jenis.map(j=>avg(d.filter(x=>x.jenis===j).map(x=>x.angka)))}
function rekapPerAnakMapel(){const a=Number($("rekapNilaiSiswa").value),m=$("rekapNilaiMapel").value,sem=$("rekapSemester").value;if(!a||!m)return alert("Pilih siswa dan mapel.");const d=nilai.filter(x=>x.absen===a&&x.mapel===m&&String(x.semester||1)===sem),s=siswa.find(x=>x.absen===a),r=kelompokJenis(d);$("judulRekapNilai").textContent=`${s?.nama||""} • ${m} • Semester ${sem}`;$("headRekapNilai").innerHTML="<tr><th>Formatif</th><th>UH/Sumatif</th><th>Tengah Semester</th><th>Akhir Semester</th><th>Rata-rata Semua Nilai</th></tr>";$("bodyRekapNilai").innerHTML=`<tr>${r.map(x=>`<td>${x}</td>`).join("")}<td><b>${avg(d.map(x=>x.angka))}</b></td></tr>`}
function rekapPerMapel(){const m=$("rekapNilaiMapel").value,sem=$("rekapSemester").value;if(!m)return alert("Pilih mapel.");$("judulRekapNilai").textContent=`${m} • Semua Siswa • Semester ${sem}`;$("headRekapNilai").innerHTML="<tr><th>No.</th><th>Nama</th><th>Formatif</th><th>UH/Sumatif</th><th>Tengah</th><th>Akhir</th><th>Rata-rata</th></tr>";$("bodyRekapNilai").innerHTML=siswa.map(s=>{const d=nilai.filter(x=>x.absen===s.absen&&x.mapel===m&&String(x.semester||1)===sem),r=kelompokJenis(d);return `<tr><td>${s.absen}</td><td><b>${esc(s.nama)}</b></td>${r.map(x=>`<td>${x}</td>`).join("")}<td><b>${avg(d.map(x=>x.angka))}</b></td></tr>`}).join("")}
function rekapSemuaMapelAnak(){const a=Number($("rekapNilaiSiswa").value),sem=$("rekapSemester").value;if(!a)return alert("Pilih siswa.");const s=siswa.find(x=>x.absen===a);$("judulRekapNilai").textContent=`${s?.nama||""} • Semua Mapel • Semester ${sem}`;$("headRekapNilai").innerHTML="<tr><th>Mapel</th><th>Formatif</th><th>UH/Sumatif</th><th>Tengah</th><th>Akhir</th><th>Rata-rata</th></tr>";$("bodyRekapNilai").innerHTML=mapel.map(m=>{const d=nilai.filter(x=>x.absen===a&&x.mapel===m&&String(x.semester||1)===sem),r=kelompokJenis(d);return `<tr><td><b>${esc(m)}</b></td>${r.map(x=>`<td>${x}</td>`).join("")}<td><b>${avg(d.map(x=>x.angka))}</b></td></tr>`}).join("")}

$("jurnalTanggal").value=today();$("catatanTanggal").value=today();
$("formJurnal").onsubmit=e=>{e.preventDefault();jurnal.unshift({tanggal:$("jurnalTanggal").value,mapel:$("jurnalMapel").value,materi:$("jurnalMateri").value.trim()});write(K.jurnal,jurnal);e.target.reset();$("jurnalTanggal").value=today();refreshOptions();renderJurnal();toast("Jurnal tersimpan")};
function renderJurnal(){$("tabelJurnal").innerHTML=jurnal.map((x,i)=>`<tr><td>${x.tanggal}</td><td>${esc(x.mapel)}</td><td>${esc(x.materi)}</td><td><button class="btn danger small" onclick="hapusUmum('jurnal',${i})">🗑️</button></td></tr>`).join("")}
$("formCatatan").onsubmit=e=>{e.preventDefault();catatan.unshift({tanggal:$("catatanTanggal").value,absen:Number($("catatanSiswa").value),isi:$("isiCatatan").value.trim()});write(K.catatan,catatan);e.target.reset();$("catatanTanggal").value=today();refreshOptions();renderCatatan();toast("Catatan tersimpan")};
function renderCatatan(){$("tabelCatatan").innerHTML=catatan.map((x,i)=>`<tr><td>${x.tanggal}</td><td>${esc(siswa.find(s=>s.absen===x.absen)?.nama||"Siswa dihapus")}</td><td>${esc(x.isi)}</td><td><button class="btn danger small" onclick="hapusUmum('catatan',${i})">🗑️</button></td></tr>`).join("")}
function hapusUmum(j,i){if(!confirm("Hapus data?"))return;if(j==="jurnal"){jurnal.splice(i,1);write(K.jurnal,jurnal);renderJurnal()}else{catatan.splice(i,1);write(K.catatan,catatan);renderCatatan()}}

function dashboard(){$("jumlahSiswa").textContent=siswa.length;const d=absensi[today()]||{},v=Object.values(d);$("hadirHariIni").textContent=v.filter(x=>x==="Hadir").length;$("izinHariIni").textContent=v.filter(x=>x==="Sakit"||x==="Izin").length;$("alpaHariIni").textContent=v.filter(x=>x==="Alpa").length;$("totalTabunganKelas").textContent=rp(tabungan.reduce((a,x)=>a+(x.jenis==="Setoran"?x.nominal:-x.nominal),0));$("tabunganBulanIni").textContent=rp(tabungan.filter(x=>x.jenis==="Setoran"&&x.tanggal.startsWith(today().slice(0,7))).reduce((a,x)=>a+x.nominal,0));$("namaWaliHeader").textContent=setting.wali;$("subJudulDashboard").textContent=`${setting.sekolah?setting.sekolah+" • ":""}${setting.kelas} • ${setting.tahun}`}
function loadSetting(){$("settingWali").value=setting.wali;$("settingKelas").value=setting.kelas;$("settingSekolah").value=setting.sekolah;$("settingTahun").value=setting.tahun}
$("formPengaturan").onsubmit=e=>{e.preventDefault();setting={wali:$("settingWali").value.trim()||"Wali Kelas 5",kelas:$("settingKelas").value.trim()||"Kelas 5",sekolah:$("settingSekolah").value.trim(),tahun:$("settingTahun").value.trim()};write(K.setting,setting);dashboard();toast("Pengaturan tersimpan")};

function eksporExcel(){if(typeof XLSX==="undefined")return alert("Library Excel belum termuat. Pastikan internet aktif.");const wb=XLSX.utils.book_new(),add=(name,data)=>XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(data.length?data:[{}]),name);
add("Data Siswa",siswa.map(s=>({No_Absen:s.absen,Nama:s.nama,Jenis_Kelamin:s.jk,Kode_Kartu:s.kode||""})));
const a=[];Object.entries(absensi).forEach(([t,d])=>siswa.forEach(s=>a.push({Tanggal:t,No_Absen:s.absen,Nama:s.nama,Status:d[s.absen]||""})));add("Absensi",a);
add("Tabungan",tabungan.map(x=>({Tanggal:x.tanggal,No_Absen:x.absen,Nama:siswa.find(s=>s.absen===x.absen)?.nama||"",Jenis:x.jenis||"Setoran",Nominal:x.nominal,Nama_Pengambil:x.pengambil||"",Nama_Kegiatan:x.namaKegiatan||"",Keterangan:x.ket||""})));
add("Rekap Tabungan",siswa.map(s=>{const d=tabungan.filter(x=>x.absen===s.absen),masuk=d.filter(x=>x.jenis==="Setoran").reduce((a,x)=>a+x.nominal,0),keluar=d.filter(x=>x.jenis!=="Setoran").reduce((a,x)=>a+x.nominal,0);return {No_Absen:s.absen,Nama:s.nama,Total_Setoran:masuk,Total_Keluar:keluar,Saldo_Akhir:masuk-keluar}}));
add("Data Mapel",mapel.map(m=>({Mata_Pelajaran:m})));
add("Nilai",nilai.map(n=>({Semester:n.semester||1,No_Absen:n.absen,Nama:siswa.find(s=>s.absen===n.absen)?.nama||"",Mata_Pelajaran:n.mapel,Jenis_Penilaian:n.jenis,Kegiatan_TP:n.kegiatan||"",Nilai:n.angka})));
add("Jurnal",jurnal.map(x=>({Tanggal:x.tanggal,Mata_Pelajaran:x.mapel,Materi_Kegiatan:x.materi})));
add("Catatan Siswa",catatan.map(x=>({Tanggal:x.tanggal,No_Absen:x.absen,Nama:siswa.find(s=>s.absen===x.absen)?.nama||"",Catatan:x.isi})));
XLSX.writeFile(wb,`Administrasi-Wali-Kelas-${today()}.xlsx`)}
$("fileExcel").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const wb=XLSX.read(r.result,{type:"array"}),names=wb.SheetNames;$("previewImpor").innerHTML=`Sheet ditemukan: <b>${names.join(", ")}</b><br><button class="btn primary" onclick="konfirmasiImporExcel()">✅ Konfirmasi Impor</button>`;window._wbImpor=wb}catch{alert("File Excel tidak dapat dibaca.")}};r.readAsArrayBuffer(f)};
function konfirmasiImporExcel(){const wb=window._wbImpor;if(!wb)return;if(!confirm("Impor akan mengganti data pada sheet yang dikenali. Lanjut?"))return;const rows=n=>wb.Sheets[n]?XLSX.utils.sheet_to_json(wb.Sheets[n],{defval:""}):null;
let d=rows("Data Siswa");if(d)siswa=d.filter(x=>x.Nama).map(x=>({absen:Number(x.No_Absen),nama:String(x.Nama),jk:String(x.Jenis_Kelamin),kode:String(x.Kode_Kartu||"")})),write(K.siswa,siswa);
d=rows("Data Mapel");if(d)mapel=d.filter(x=>x.Mata_Pelajaran).map(x=>String(x.Mata_Pelajaran)),write(K.mapel,mapel);
d=rows("Tabungan");if(d)tabungan=d.filter(x=>x.Tanggal&&x.No_Absen).map(x=>({tanggal:String(x.Tanggal).slice(0,10),absen:Number(x.No_Absen),jenis:String(x.Jenis||"Setoran"),nominal:Number(x.Nominal),pengambil:String(x.Nama_Pengambil||""),namaKegiatan:String(x.Nama_Kegiatan||""),ket:String(x.Keterangan||"")})),write(K.tabungan,tabungan);
d=rows("Nilai");if(d)nilai=d.filter(x=>x.No_Absen&&x.Mata_Pelajaran).map(x=>({semester:String(x.Semester||1),absen:Number(x.No_Absen),mapel:String(x.Mata_Pelajaran),jenis:String(x.Jenis_Penilaian),kegiatan:String(x.Kegiatan_TP||""),angka:Number(x.Nilai)})),write(K.nilai,nilai);
alert("Impor selesai. Aplikasi akan dimuat ulang.");location.reload()}
function eksporJSON(){const blob=new Blob([JSON.stringify({siswa,absensi,tabungan,mapel,nilai,jurnal,catatan,setting},null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`backup-wali-kelas-${today()}.json`;a.click();URL.revokeObjectURL(a.href)}
$("fileJSON").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!confirm("Ganti semua data dengan backup ini?"))return;Object.entries(K).forEach(([n,k])=>{if(d[n]!==undefined)write(k,d[n])});location.reload()}catch{alert("File JSON tidak valid.")}};r.readAsText(f)}
function cetakBagian(id){bukaHalaman(id);document.querySelectorAll(".page").forEach(p=>p.classList.remove("printing"));$(id).classList.add("printing");setTimeout(()=>{window.print();$(id).classList.remove("printing")},120)}

refreshOptions();renderSiswa();renderAbsensi();tampilkanRekap();renderSetoranMassal();tampilkanRekapHarian();tampilkanTabungan();renderKegiatanMassal();renderMapel();renderNilai();renderJurnal();renderCatatan();loadSetting();dashboard();