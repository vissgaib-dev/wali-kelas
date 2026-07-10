let siswa=[],editId=null,jenisKeu=[];
const $=id=>document.getElementById(id),rp=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n||0),esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
async function cek(){const{data:{session}}=await supabaseClient.auth.getSession();if(!session)return location.replace("login.html");const{data:p}=await supabaseClient.from("profil_pengguna").select("peran").eq("id",session.user.id).single();if(p?.peran!=="guru"&&session.user.user_metadata?.role!=="guru"&&session.user.app_metadata?.role!=="guru")return location.replace("login.html");await muat()}
async function muat(){const[{data:s},{data:a},{data:t},{data:j},{data:p}]=await Promise.all([supabaseClient.from("siswa").select("*").eq("aktif",true).order("nomor_absen"),supabaseClient.from("absensi").select("*").eq("tanggal",new Date().toISOString().slice(0,10)),supabaseClient.from("transaksi_tabungan").select("*").order("tanggal",{ascending:false}),supabaseClient.from("jenis_keuangan").select("*").eq("aktif",true),supabaseClient.from("pembayaran_siswa").select("*,jenis_keuangan(nama)").order("tanggal",{ascending:false})]);siswa=s||[];jenisKeu=j||[];$("jml").textContent=siswa.length;$("hadir").textContent=(a||[]).filter(x=>x.status==="Hadir").length;$("saldo").textContent=rp((t||[]).reduce((z,x)=>z+(x.jenis==="Setoran"?Number(x.jumlah):-Number(x.jumlah)),0));$("bayar").textContent=rp((p||[]).reduce((z,x)=>z+Number(x.jumlah),0));renderSiswa();renderAbs();renderSelect();renderTab(t||[]);renderBayar(p||[]);refreshAdminOptions();renderMapel();renderNilai();renderJurnal();renderCatatan();loadIdentitas();renderLimaHadir(a||[])}
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>openPage(b.dataset.page));function openPage(id){document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));$(id).classList.add("active");document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.page===id))}
function renderSiswa(){const q=($("cari")?.value||"").toLowerCase();$("tbSiswa").innerHTML=siswa.filter(x=>x.nama.toLowerCase().includes(q)||(x.nisn||"").includes(q)).map(x=>`<tr><td>${x.nomor_absen}</td><td><b>${esc(x.nama)}</b></td><td>${esc(x.nis||"-")}</td><td>${esc(x.nisn||"-")}</td><td>${esc(x.jenis_kelamin)}</td><td><button class="small" onclick="editS('${x.id}')">Edit</button> <button class="small danger" onclick="hapusS('${x.id}')">Hapus</button></td></tr>`).join("")||'<tr><td colspan="6">Belum ada siswa.</td></tr>'}
function bukaModal(){editId=null;$("fSiswa").reset();$("modalTitle").textContent="Tambah Siswa";$("modal").classList.add("active")}function tutupModal(){$("modal").classList.remove("active")}function editS(id){const x=siswa.find(v=>v.id===id);editId=id;$("nama").value=x.nama;$("nis").value=x.nis||"";$("nisn").value=x.nisn||"";$("absen").value=x.nomor_absen;$("jk").value=x.jenis_kelamin;$("modalTitle").textContent="Edit Siswa";$("modal").classList.add("active")}
$("fSiswa").onsubmit=async e=>{e.preventDefault();const row={nama:$("nama").value.trim(),nis:$("nis").value.trim()||null,nisn:$("nisn").value.trim(),nomor_absen:Number($("absen").value),jenis_kelamin:$("jk").value,kelas:"5",aktif:true};const q=editId?supabaseClient.from("siswa").update(row).eq("id",editId):supabaseClient.from("siswa").insert(row);const{error}=await q;if(error)return alert(error.message);tutupModal();await muat()}
async function hapusS(id){if(!confirm("Nonaktifkan siswa ini?"))return;await supabaseClient.from("siswa").update({aktif:false}).eq("id",id);await muat()}
function renderAbs(){const opts=`<option>Hadir</option><option>Sakit</option><option>Izin</option><option>Alpa</option>`;$("tbAbs").innerHTML=siswa.map(x=>`<tr><td>${x.nomor_absen}</td><td>${esc(x.nama)}</td><td><select id="abs-${x.id}">${opts}</select></td></tr>`).join("")}
async function simpanAbsensi(){const tanggal=$("tglAbs").value,rows=siswa.map(x=>({siswa_id:x.id,tanggal,status:$("abs-"+x.id).value,metode:"Manual"}));const{error}=await supabaseClient.from("absensi").upsert(rows,{onConflict:"siswa_id,tanggal"});if(error)return alert(error.message);alert("Absensi tersimpan");await muat()}
function renderSelect(){const o='<option value="">Pilih siswa</option>'+siswa.map(x=>`<option value="${x.id}">${x.nomor_absen}. ${esc(x.nama)}</option>`).join("");$("tabSiswa").innerHTML=o;$("bySiswa").innerHTML=o;$("byJenis").innerHTML='<option value="">Pilih pembayaran</option>'+jenisKeu.map(x=>`<option value="${x.id}" data-n="${x.nominal_tagihan}">${esc(x.nama)} - ${rp(x.nominal_tagihan)}</option>`).join("")};if($("byMassJenis"))$("byMassJenis").innerHTML='<option value="">Pilih pembayaran</option>'+jenisKeu.map(x=>`<option value="${x.id}" data-n="${x.nominal_tagihan}">${esc(x.nama)} - ${rp(x.nominal_tagihan)}</option>`).join("")
$("byJenis").onchange=()=>{const o=$("byJenis").selectedOptions[0];if(o?.dataset.n)$("byJumlah").value=o.dataset.n}
$("fTab").onsubmit=async e=>{e.preventDefault();const{error}=await supabaseClient.from("transaksi_tabungan").insert({siswa_id:$("tabSiswa").value,jenis:$("tabJenis").value,jumlah:Number($("tabJumlah").value),keterangan:$("tabKet").value.trim()});if(error)return alert(error.message);e.target.reset();await muat()}
function renderTab(d){$("tbTab").innerHTML=d.map(x=>{const s=siswa.find(v=>v.id===x.siswa_id);return`<tr><td>${x.tanggal}</td><td>${esc(s?.nama||"-")}</td><td>${x.jenis}</td><td>${rp(x.jumlah)}</td><td>${esc(x.keterangan||"-")}</td></tr>`}).join("")}
$("fJenis").onsubmit=async e=>{e.preventDefault();const{error}=await supabaseClient.from("jenis_keuangan").insert({nama:$("jkNama").value.trim(),kategori:$("jkKategori").value,nominal_tagihan:Number($("jkNominal").value),periode:$("jkPeriode").value.trim()});if(error)return alert(error.message);e.target.reset();await muat()}
$("fBayar").onsubmit=async e=>{e.preventDefault();const metode=$("byMetode").value,jumlah=Number($("byJumlah").value),sid=$("bySiswa").value,jid=$("byJenis").value;if(metode==="Potong Tabungan"){if(!confirm("Pastikan ada persetujuan orang tua. Lanjut potong tabungan?"))return;const{error:t}=await supabaseClient.from("transaksi_tabungan").insert({siswa_id:sid,jenis:"Penarikan",jumlah,keterangan:"Pembayaran kelas melalui potong tabungan"});if(t)return alert(t.message)}const{error}=await supabaseClient.from("pembayaran_siswa").insert({siswa_id:sid,jenis_keuangan_id:jid,jumlah,metode,persetujuan_wali:metode==="Potong Tabungan"});if(error)return alert(error.message);e.target.reset();await muat()}
function renderBayar(d){$("tbBayar").innerHTML=d.map(x=>{const s=siswa.find(v=>v.id===x.siswa_id);return`<tr><td>${x.tanggal}</td><td>${esc(s?.nama||"-")}</td><td>${esc(x.jenis_keuangan?.nama||"-")}</td><td>${x.metode}</td><td>${rp(x.jumlah)}</td></tr>`}).join("")}

let tabMassSiap=false,byMassSiap=false;
function siapkanTabunganMassal(){
  tabMassSiap=true;
  $("infoTabMass").textContent=`${$("tabMassJenis").value} • ${$("tabMassKet").value.trim()||"Tanpa keterangan umum"}`;
  $("tbTabMass").innerHTML=siswa.map(x=>`<tr><td>${x.nomor_absen}</td><td><b>${esc(x.nama)}</b></td><td><input id="tm-${x.id}" class="nilai-massal-input" type="number" min="0" placeholder="0"></td><td><input id="tk-${x.id}" placeholder="Opsional"></td><td id="ts-${x.id}">Belum diisi</td></tr>`).join("")||'<tr><td colspan="5">Belum ada siswa aktif.</td></tr>';
  isiSemuaTabungan();
}
function isiSemuaTabungan(){
  if(!tabMassSiap)return siapkanTabunganMassal();
  const n=$("tabMassNominal").value;
  siswa.forEach(x=>{const i=$("tm-"+x.id);if(i){i.value=n;$("ts-"+x.id).textContent=n&&Number(n)>0?"Siap disimpan":"Belum diisi"}});
}
async function simpanTabunganMassal(){
  if(!tabMassSiap)return alert("Tampilkan siswa dulu.");
  const jenis=$("tabMassJenis").value,ketUmum=$("tabMassKet").value.trim();
  const rows=siswa.map(x=>({x,n:$("tm-"+x.id)?.value,k:$("tk-"+x.id)?.value.trim()})).filter(r=>r.n&&Number(r.n)>0);
  if(!rows.length)return alert("Belum ada nominal yang diisi.");
  if(!confirm(`Simpan ${rows.length} transaksi ${jenis.toLowerCase()} sekaligus?`))return;
  const payload=rows.map(r=>({siswa_id:r.x.id,jenis,jumlah:Number(r.n),keterangan:r.k||ketUmum||"Transaksi massal"}));
  const{error}=await supabaseClient.from("transaksi_tabungan").insert(payload);
  if(error)return alert("Gagal: "+error.message);
  alert(`${rows.length} transaksi berhasil disimpan.`);tabMassSiap=false;await muat();siapkanTabunganMassal();
}
function ubahJenisBayarMassal(){
  const o=$("byMassJenis").selectedOptions[0];if(o?.dataset.n)$("byMassNominal").value=o.dataset.n;
}
function siapkanPembayaranMassal(){
  const jid=$("byMassJenis").value;if(!jid)return alert("Pilih jenis pembayaran dulu.");
  byMassSiap=true;const nama=$("byMassJenis").selectedOptions[0]?.textContent||"Pembayaran";
  $("infoByMass").textContent=`${nama} • ${$("byMassMetode").value}`;
  $("tbByMass").innerHTML=siswa.map(x=>`<tr><td><input id="bc-${x.id}" type="checkbox" style="width:22px;height:22px"></td><td>${x.nomor_absen}</td><td><b>${esc(x.nama)}</b></td><td><input id="bn-${x.id}" class="nilai-massal-input" type="number" min="0" value="${$("byMassNominal").value||""}" placeholder="0"></td><td id="bs-${x.id}">Belum dipilih</td></tr>`).join("")||'<tr><td colspan="5">Belum ada siswa aktif.</td></tr>';
  siswa.forEach(x=>{const c=$("bc-"+x.id);if(c)c.onchange=()=>{$("bs-"+x.id).textContent=c.checked?"Siap disimpan":"Belum dipilih"}});
}
function isiSemuaPembayaran(){
  if(!byMassSiap)return siapkanPembayaranMassal();
  const n=$("byMassNominal").value;
  siswa.forEach(x=>{const c=$("bc-"+x.id),i=$("bn-"+x.id);if(c&&i){c.checked=true;i.value=n;$("bs-"+x.id).textContent="Siap disimpan"}});
}
async function simpanPembayaranMassal(){
  if(!byMassSiap)return alert("Tampilkan siswa dulu.");
  const jid=$("byMassJenis").value,metode=$("byMassMetode").value;
  const rows=siswa.map(x=>({x,c:$("bc-"+x.id),n:$("bn-"+x.id)?.value})).filter(r=>r.c?.checked);
  if(!rows.length)return alert("Belum ada siswa yang dicentang.");
  if(rows.some(r=>!r.n||Number(r.n)<=0))return alert("Semua siswa yang dicentang harus punya nominal.");
  if(metode==="Potong Tabungan"&&!confirm("Pembayaran ini akan memotong tabungan siswa yang dicentang. Pastikan ada persetujuan orang tua. Lanjut?"))return;
  if(metode!=="Potong Tabungan"&&!confirm(`Simpan ${rows.length} pembayaran sekaligus?`))return;
  if(metode==="Potong Tabungan"){
    const potong=rows.map(r=>({siswa_id:r.x.id,jenis:"Penarikan",jumlah:Number(r.n),keterangan:"Pembayaran kelas melalui potong tabungan"}));
    const{error:t}=await supabaseClient.from("transaksi_tabungan").insert(potong);if(t)return alert("Gagal memotong tabungan: "+t.message);
  }
  const payload=rows.map(r=>({siswa_id:r.x.id,jenis_keuangan_id:jid,jumlah:Number(r.n),metode,persetujuan_wali:metode==="Potong Tabungan"}));
  const{error}=await supabaseClient.from("pembayaran_siswa").insert(payload);
  if(error)return alert("Gagal: "+error.message);
  alert(`${rows.length} pembayaran berhasil disimpan.`);byMassSiap=false;await muat();siapkanPembayaranMassal();
}

function tabKeu(id,b){document.querySelectorAll(".keu").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));$(id).classList.add("active");b.classList.add("active")}

function downloadTemplateSiswa(){const data=[["No. Absen","Nama","NIS","NISN","Jenis Kelamin"],[1,"Nama Siswa","12345","0012345678","Laki-laki"]];const ws=XLSX.utils.aoa_to_sheet(data);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"Data Siswa");XLSX.writeFile(wb,"Template_Import_Siswa.xlsx")}
function exportSiswa(){const data=siswa.map(x=>({"No. Absen":x.nomor_absen,"Nama":x.nama,"NIS":x.nis||"","NISN":x.nisn||"","Jenis Kelamin":x.jenis_kelamin}));const ws=XLSX.utils.json_to_sheet(data);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"Data Siswa");XLSX.writeFile(wb,"Data_Siswa_Kelas_5.xlsx")}
async function importSiswa(input){const file=input.files?.[0];if(!file)return;try{const buf=await file.arrayBuffer(),wb=XLSX.read(buf),ws=wb.Sheets[wb.SheetNames[0]],rows=XLSX.utils.sheet_to_json(ws,{defval:""});if(!rows.length)throw new Error("File kosong.");const pick=(r,names)=>{for(const n of names)if(r[n]!==undefined&&String(r[n]).trim()!=="")return r[n];return""};const data=rows.map((r,i)=>({nama:String(pick(r,["Nama","nama","NAMA"])).trim(),nis:String(pick(r,["NIS","nis"])).trim()||null,nisn:String(pick(r,["NISN","nisn"])).trim(),nomor_absen:Number(pick(r,["No. Absen","Nomor Absen","Absen","nomor_absen"])),jenis_kelamin:String(pick(r,["Jenis Kelamin","JK","jenis_kelamin"])).trim(),kelas:"5",aktif:true})).filter(x=>x.nama&&x.nisn&&x.nomor_absen);if(!data.length)throw new Error("Kolom tidak cocok. Gunakan tombol Template Excel.");const nisnFile=data.map(x=>x.nisn),absenFile=data.map(x=>x.nomor_absen);if(new Set(nisnFile).size!==nisnFile.length)throw new Error("Ada NISN ganda di file.");if(new Set(absenFile).size!==absenFile.length)throw new Error("Ada nomor absen ganda di file.");const bentrok=data.filter(x=>siswa.some(s=>String(s.nisn)===x.nisn||Number(s.nomor_absen)===x.nomor_absen));if(bentrok.length)throw new Error("Ada data yang bentrok dengan siswa yang sudah ada: "+bentrok.map(x=>x.nama).join(", "));if(!confirm(`Import ${data.length} siswa sekarang?`))return;const{error}=await supabaseClient.from("siswa").insert(data);if(error)throw error;alert(`${data.length} siswa berhasil diimport.`);await muat()}catch(e){alert("Import gagal: "+e.message)}finally{input.value=""}}

const ADMIN_KEY="wali_kelas_admin_pro_v1";
let admin=JSON.parse(localStorage.getItem(ADMIN_KEY)||"null")||{mapel:["Pendidikan Pancasila","Bahasa Indonesia","Matematika","IPAS","Seni Budaya","PJOK","Bahasa Inggris"],nilai:[],jurnal:[],catatan:[],identitas:{sekolah:"",npsn:"",alamat:"",desa:"",kecamatan:"",kabupaten:"Lombok Barat",provinsi:"Nusa Tenggara Barat",kepsek:"",nipKepsek:"",wali:"",nipWali:"",kelas:"Kelas 5",tahun:"2026/2027",semester:"Semester 1"}};
const saveAdmin=()=>localStorage.setItem(ADMIN_KEY,JSON.stringify(admin));
const nmSiswa=id=>siswa.find(x=>String(x.id)===String(id))?.nama||"Siswa";
function refreshAdminOptions(){const so='<option value="">Pilih siswa</option>'+siswa.map(x=>`<option value="${x.id}">${x.nomor_absen}. ${esc(x.nama)}</option>`).join("");["nilaiSiswa","catatanSiswa"].forEach(id=>{if($(id))$(id).innerHTML=so});if($("rekapSiswa"))$("rekapSiswa").innerHTML='<option value="">Semua siswa</option>'+siswa.map(x=>`<option value="${x.id}">${x.nomor_absen}. ${esc(x.nama)}</option>`).join("");const mo='<option value="">Pilih mapel</option>'+admin.mapel.map(m=>`<option value="${esc(m)}">${esc(m)}</option>`).join("");["nilaiMapel","jurnalMapel"].forEach(id=>{if($(id))$(id).innerHTML=mo});if($("rekapMapel"))$("rekapMapel").innerHTML='<option value="">Semua mapel</option>'+admin.mapel.map(m=>`<option value="${esc(m)}">${esc(m)}</option>`).join("")};isiOpsiRekapAbsensi()
function renderMapel(){if(!$("tbMapel"))return;$("tbMapel").innerHTML=admin.mapel.map((m,i)=>`<tr><td>${i+1}</td><td><b>${esc(m)}</b></td><td><button class="small danger" onclick="hapusMapel(${i})">Hapus</button></td></tr>`).join("")}
$("fMapel").onsubmit=e=>{e.preventDefault();const m=$("namaMapel").value.trim();if(!m)return;if(admin.mapel.some(x=>x.toLowerCase()===m.toLowerCase()))return alert("Mapel sudah ada.");admin.mapel.push(m);saveAdmin();e.target.reset();renderMapel();refreshAdminOptions()}
function hapusMapel(i){if(!confirm("Hapus mata pelajaran ini?"))return;admin.mapel.splice(i,1);saveAdmin();renderMapel();refreshAdminOptions()}

let nilaiMassalSiap=false;
function kunciNilaiMassal(){
  return {
    semester:$("nilaiSemester").value,
    mapel:$("nilaiMapel").value,
    jenis:$("nilaiJenis").value,
    kegiatan:$("nilaiKegiatan").value.trim()
  };
}
function siapkanNilaiMassal(){
  const k=kunciNilaiMassal();
  if(!k.mapel)return alert("Pilih mata pelajaran dulu.");
  if(!k.kegiatan)return alert("Isi nama kegiatan / TP dulu.");
  nilaiMassalSiap=true;
  $("infoNilaiMassal").textContent=`${k.mapel} • ${k.jenis} • ${k.kegiatan} • Semester ${k.semester}`;
  $("tbNilaiMassal").innerHTML=siswa.map(x=>{
    const lama=admin.nilai.find(n=>n.semester===k.semester&&n.siswa_id===String(x.id)&&n.mapel===k.mapel&&n.jenis===k.jenis&&n.kegiatan===k.kegiatan);
    return `<tr><td>${x.nomor_absen}</td><td><b>${esc(x.nama)}</b></td><td><input class="nilai-massal-input" id="nm-${x.id}" type="number" min="0" max="100" value="${lama?.angka??""}" placeholder="0-100" oninput="statusNilaiMassal('${x.id}')"></td><td id="st-${x.id}">${lama?"Sudah ada":"Belum diisi"}</td></tr>`;
  }).join("")||'<tr><td colspan="4">Belum ada siswa aktif.</td></tr>';
}
function statusNilaiMassal(id){
  const v=$("nm-"+id).value,st=$("st-"+id);
  st.textContent=v===""?"Belum diisi":(+v>=0&&+v<=100?"Siap disimpan":"Nilai tidak valid");
}
function kosongkanNilaiMassal(){
  document.querySelectorAll(".nilai-massal-input").forEach(x=>x.value="");
  siswa.forEach(x=>{if($("st-"+x.id))$("st-"+x.id).textContent="Belum diisi"});
}
function simpanNilaiMassal(){
  if(!nilaiMassalSiap)return alert("Tampilkan siswa dulu.");
  const k=kunciNilaiMassal();
  if(!k.mapel||!k.kegiatan)return alert("Pengaturan penilaian belum lengkap.");
  const isi=siswa.map(x=>({siswa:x,input:$("nm-"+x.id)})).filter(x=>x.input&&x.input.value!=="");
  if(!isi.length)return alert("Belum ada nilai yang diisi.");
  const salah=isi.find(x=>Number(x.input.value)<0||Number(x.input.value)>100);
  if(salah)return alert(`Nilai ${salah.siswa.nama} harus 0 sampai 100.`);
  if(!confirm(`Simpan ${isi.length} nilai sekaligus?`))return;
  isi.forEach(({siswa:x,input})=>{
    const idx=admin.nilai.findIndex(n=>n.semester===k.semester&&n.siswa_id===String(x.id)&&n.mapel===k.mapel&&n.jenis===k.jenis&&n.kegiatan===k.kegiatan);
    const row={id:idx>=0?admin.nilai[idx].id:Date.now()+Math.random(),semester:k.semester,siswa_id:String(x.id),mapel:k.mapel,jenis:k.jenis,kegiatan:k.kegiatan,angka:Number(input.value)};
    if(idx>=0)admin.nilai[idx]=row;else admin.nilai.unshift(row);
  });
  saveAdmin();renderNilai();siapkanNilaiMassal();
  alert(`${isi.length} nilai berhasil disimpan sekaligus.`);
}

function renderNilai(){if(!$("tbNilai"))return;$("tbNilai").innerHTML=admin.nilai.map((x,i)=>`<tr><td>${x.semester}</td><td>${esc(nmSiswa(x.siswa_id))}</td><td>${esc(x.mapel)}</td><td>${esc(x.jenis)}</td><td>${esc(x.kegiatan||"-")}</td><td><b>${x.angka}</b></td><td><button class="small danger" onclick="hapusAdmin('nilai',${i})">Hapus</button></td></tr>`).join("")}
function avg(a){return a.length?(a.reduce((z,x)=>z+Number(x),0)/a.length).toFixed(1):"-"}
function buatRekapNilai(){const sem=$("rekapSemester").value,sid=$("rekapSiswa").value,m=$("rekapMapel").value;let d=admin.nilai.filter(x=>x.semester===sem&&(!sid||x.siswa_id===sid)&&(!m||x.mapel===m));$("judulRekap").textContent=`Semester ${sem}${sid?" • "+nmSiswa(sid):""}${m?" • "+m:""}`;$("headRekap").innerHTML="<tr><th>Siswa</th><th>Mapel</th><th>Formatif</th><th>Sumatif/UH</th><th>Tengah</th><th>Akhir</th><th>Rata-rata</th></tr>";const keys=[...new Set(d.map(x=>x.siswa_id+"|||"+x.mapel))];$("bodyRekap").innerHTML=keys.map(k=>{const [s,mp]=k.split("|||"),r=d.filter(x=>x.siswa_id===s&&x.mapel===mp),v=j=>avg(r.filter(x=>x.jenis===j).map(x=>x.angka));return`<tr><td>${esc(nmSiswa(s))}</td><td>${esc(mp)}</td><td>${v("Formatif")}</td><td>${v("Sumatif/UH")}</td><td>${v("Tengah Semester")}</td><td>${v("Akhir Semester")}</td><td><b>${avg(r.map(x=>x.angka))}</b></td></tr>`}).join("")||'<tr><td colspan="7">Belum ada nilai.</td></tr>'}
$("fJurnal").onsubmit=e=>{e.preventDefault();admin.jurnal.unshift({tanggal:$("jurnalTanggal").value,mapel:$("jurnalMapel").value,materi:$("jurnalMateri").value.trim(),capaian:$("jurnalCapaian").value.trim(),kendala:$("jurnalKendala").value.trim(),tindak:$("jurnalTindak").value.trim()});saveAdmin();e.target.reset();$("jurnalTanggal").value=new Date().toISOString().slice(0,10);renderJurnal()}
function renderJurnal(){if(!$("tbJurnal"))return;$("tbJurnal").innerHTML=admin.jurnal.map((x,i)=>`<tr><td>${x.tanggal}</td><td>${esc(x.mapel)}</td><td>${esc(x.materi)}</td><td>${esc(x.capaian||"-")}</td><td>${esc(x.kendala||"-")}</td><td>${esc(x.tindak||"-")}</td><td><button class="small danger" onclick="hapusAdmin('jurnal',${i})">Hapus</button></td></tr>`).join("")}
$("fCatatan").onsubmit=e=>{e.preventDefault();admin.catatan.unshift({tanggal:$("catatanTanggal").value,siswa_id:$("catatanSiswa").value,kategori:$("catatanKategori").value,isi:$("catatanIsi").value.trim(),tindak:$("catatanTindak").value.trim()});saveAdmin();e.target.reset();$("catatanTanggal").value=new Date().toISOString().slice(0,10);renderCatatan()}
function renderCatatan(){if(!$("tbCatatan"))return;$("tbCatatan").innerHTML=admin.catatan.map((x,i)=>`<tr><td>${x.tanggal}</td><td>${esc(nmSiswa(x.siswa_id))}</td><td>${esc(x.kategori)}</td><td>${esc(x.isi)}</td><td>${esc(x.tindak||"-")}</td><td><button class="small danger" onclick="hapusAdmin('catatan',${i})">Hapus</button></td></tr>`).join("")}
function hapusAdmin(k,i){if(!confirm("Hapus data ini?"))return;admin[k].splice(i,1);saveAdmin();({nilai:renderNilai,jurnal:renderJurnal,catatan:renderCatatan}[k])()}
function loadIdentitas(){const x=admin.identitas,m={idSekolah:"sekolah",idNpsn:"npsn",idAlamat:"alamat",idDesa:"desa",idKecamatan:"kecamatan",idKabupaten:"kabupaten",idProvinsi:"provinsi",idKepsek:"kepsek",idNipKepsek:"nipKepsek",idWali:"wali",idNipWali:"nipWali",idKelas:"kelas",idTahun:"tahun",idSemester:"semester"};Object.entries(m).forEach(([id,k])=>{if($(id))$(id).value=x[k]||""});if($("dashboardWali"))$("dashboardWali").textContent=x.wali||"Wali Kelas 5";if($("dashboardIdentity"))$("dashboardIdentity").textContent=[x.sekolah,x.kelas,x.tahun,x.semester].filter(Boolean).join(" • ")}
$("fIdentitas").onsubmit=e=>{e.preventDefault();admin.identitas={sekolah:$("idSekolah").value.trim(),npsn:$("idNpsn").value.trim(),alamat:$("idAlamat").value.trim(),desa:$("idDesa").value.trim(),kecamatan:$("idKecamatan").value.trim(),kabupaten:$("idKabupaten").value.trim(),provinsi:$("idProvinsi").value.trim(),kepsek:$("idKepsek").value.trim(),nipKepsek:$("idNipKepsek").value.trim(),wali:$("idWali").value.trim(),nipWali:$("idNipWali").value.trim(),kelas:$("idKelas").value.trim(),tahun:$("idTahun").value.trim(),semester:$("idSemester").value};saveAdmin();loadIdentitas();alert("Identitas tersimpan.")}
function renderLimaHadir(a){if(!$("limaHadir"))return;const ids=(a||[]).filter(x=>x.status==="Hadir").slice(0,5).map(x=>x.siswa_id);$("limaHadir").innerHTML=ids.length?ids.map((id,i)=>`<div class="present-item"><b>${i+1}</b><span>${esc(nmSiswa(id))}</span></div>`).join(""):"Belum ada siswa hadir hari ini."}


let dataRekapAbsensi=[];

function isiOpsiRekapAbsensi(){
  if(!$("rekapAbsSiswa"))return;
  const lama=$("rekapAbsSiswa").value;
  $("rekapAbsSiswa").innerHTML='<option value="">Semua siswa</option>'+siswa.map(x=>`<option value="${x.id}">${x.nomor_absen}. ${esc(x.nama)}</option>`).join("");
  $("rekapAbsSiswa").value=lama;
}

function ubahModeRekapAbsensi(){
  const semester=$("rekapAbsMode").value==="semester";
  $("rekapAbsBulan").style.display=semester?"none":"block";
  $("rekapAbsSemester").style.display=semester?"block":"none";
}

function rentangRekapAbsensi(){
  const mode=$("rekapAbsMode").value;
  if(mode==="bulan"){
    const v=$("rekapAbsBulan").value;
    if(!v)throw new Error("Pilih bulan dulu.");
    const [y,m]=v.split("-").map(Number);
    const awal=`${y}-${String(m).padStart(2,"0")}-01`;
    const akhir=new Date(y,m,0).toISOString().slice(0,10);
    return {awal,akhir,label:new Date(y,m-1,1).toLocaleDateString("id-ID",{month:"long",year:"numeric"})};
  }
  const sem=$("rekapAbsSemester").value;
  const tahun=admin.identitas.tahun||"2026/2027";
  const parts=tahun.split("/").map(Number);
  const y1=parts[0]||new Date().getFullYear(),y2=parts[1]||y1+1;
  return sem==="1"
    ?{awal:`${y1}-07-01`,akhir:`${y1}-12-31`,label:`Semester 1 Tahun Pelajaran ${tahun}`}
    :{awal:`${y2}-01-01`,akhir:`${y2}-06-30`,label:`Semester 2 Tahun Pelajaran ${tahun}`};
}

async function buatRekapAbsensi(){
  try{
    const r=rentangRekapAbsensi(),sid=$("rekapAbsSiswa").value;
    let q=supabaseClient.from("absensi").select("siswa_id,tanggal,status").gte("tanggal",r.awal).lte("tanggal",r.akhir).order("tanggal");
    if(sid)q=q.eq("siswa_id",sid);
    const{data,error}=await q;
    if(error)throw error;
    const daftar=sid?siswa.filter(x=>String(x.id)===String(sid)):siswa;
    dataRekapAbsensi=daftar.map(s=>{
      const d=(data||[]).filter(a=>String(a.siswa_id)===String(s.id));
      const hitung=status=>d.filter(a=>a.status===status).length;
      const hadir=hitung("Hadir"),sakit=hitung("Sakit"),izin=hitung("Izin"),alpa=hitung("Alpa"),total=d.length;
      return {nomor_absen:s.nomor_absen,nama:s.nama,hadir,sakit,izin,alpa,total,persen:total?((hadir/total)*100).toFixed(1):"0.0"};
    });
    const semua=data||[],hariUnik=new Set(semua.map(x=>x.tanggal)).size;
    $("rekapHariTercatat").textContent=hariUnik;
    $("rekapTotalHadir").textContent=semua.filter(x=>x.status==="Hadir").length;
    $("rekapTotalSakit").textContent=semua.filter(x=>x.status==="Sakit").length;
    $("rekapTotalIzinAlpa").textContent=semua.filter(x=>x.status==="Izin"||x.status==="Alpa").length;
    $("judulRekapAbsensi").textContent="Rekap Absensi "+r.label;
    $("subjudulRekapAbsensi").textContent=[admin.identitas.sekolah,admin.identitas.kelas,admin.identitas.wali].filter(Boolean).join(" • ")||"Kelas 5";
    $("tbRekapAbsensi").innerHTML=dataRekapAbsensi.map(x=>`<tr><td>${x.nomor_absen}</td><td><b>${esc(x.nama)}</b></td><td>${x.hadir}</td><td>${x.sakit}</td><td>${x.izin}</td><td>${x.alpa}</td><td>${x.total}</td><td><b>${x.persen}%</b></td></tr>`).join("")||'<tr><td colspan="8">Belum ada data absensi pada periode ini.</td></tr>';
  }catch(e){alert("Rekap gagal: "+e.message)}
}

function exportRekapAbsensi(){
  if(!dataRekapAbsensi.length)return alert("Tampilkan rekap dulu.");
  const data=dataRekapAbsensi.map(x=>({"No. Absen":x.nomor_absen,"Nama Siswa":x.nama,"Hadir":x.hadir,"Sakit":x.sakit,"Izin":x.izin,"Alpa":x.alpa,"Total Tercatat":x.total,"Persentase Kehadiran":x.persen+"%"}));
  const ws=XLSX.utils.json_to_sheet(data),wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Rekap Absensi");
  XLSX.writeFile(wb,"Rekap_Absensi_Kelas_5.xlsx");
}

function cetakRekapAbsensi(){
  if(!dataRekapAbsensi.length)return alert("Tampilkan rekap dulu.");
  const isi=$("areaCetakRekapAbsensi").innerHTML,w=window.open("","_blank");
  w.document.write(`<!doctype html><html><head><title>Rekap Absensi</title><style>body{font-family:Arial;padding:28px;color:#17243a}table{width:100%;border-collapse:collapse}th,td{border:1px solid #bbb;padding:8px;text-align:left}th{background:#eee}h2{margin-bottom:6px}.muted{color:#555}@media print{button{display:none}}</style></head><body>${isi}</body></html>`);
  w.document.close();w.focus();w.print();
}

async function keluar(){await supabaseClient.auth.signOut();location.href="index.html"}
if($("rekapAbsBulan"))$("rekapAbsBulan").value=new Date().toISOString().slice(0,7);$("today").textContent=new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"});$("tglAbs").value=new Date().toISOString().slice(0,10);if($("jurnalTanggal"))$("jurnalTanggal").value=new Date().toISOString().slice(0,10);if($("catatanTanggal"))$("catatanTanggal").value=new Date().toISOString().slice(0,10);cek();