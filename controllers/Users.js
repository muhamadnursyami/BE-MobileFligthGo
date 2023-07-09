import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
// fungsi untuk mengecek di web browser apakah server berjalan
export const getRoot = async(req, res) => {
  res.status(200).json({
    status: "OK",
    message: "FlightGo API is up and running!",
  });
}
// Menampilkan semua data user dan hanya admin saja yang bisa mengakses
export const getUsers = async(req, res) => {
    if(req.user.role !== "admin") { // cek role
      return res.status(400).json({
          success: false,
          message: "Kamu gak bisa mengakses ini dengan role member",
      });
    }
  try {
    const users = await Users.findAll({ // mencari semua user
      attributes:['id','image_user','name','email', 'role','phone','address','visa','passport','izin','createdAt','updatedAt']
    });
    res.json(users); // respon berupa json
  } catch (error) {
  console.log(error); // jika error
  }
}
// Mencari single user berdasarkan id
export const getUsersByid = async(req, res) => {
  if(req.user.role !== "admin") { // cek role
    return res.status(400).json({
        success: false,
        message: "Kamu gak bisa mengakses ini dengan role member",
    });
  }
try {
  const users = await Users.findOne({ // mencari single user berdasarkan id params
    where: {
      id: req.params.id
  },
    attributes:['id','image_user','name','email', 'role','phone','address','visa','passport','izin','createdAt','updatedAt'] //kemudian menampilkan atributnya
  });
  res.json(users); //respon berupa json
} catch (error) {
console.log(error); // jika error
}
}

// FITUR REGISTRASI
export const Register = async(req, res) => {
    const { email,name, password } = req.body; // Input yang di perlukan
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt); // hash password untuk keamanan
    try {
        const user = await Users.findOne({  // cek email jika sudah terdaftar atau belum
          where: { email: email } 
        });
        if (user) {
          res.status(400).json({ message: "Email sudah terdaftar" }); // jika email yang digunakan registrasi sudah ada
          return;
        } 
        await Users.create({ // fungsi untuk create new user di database
            name: name,
            email: email,
            password: hashPassword,
            role: "member" // role otomatis menjadi meber
        });
        res.json({message: "Register Berhasil"}); // respon jika register berhasil
    } catch (error) {
        console.log(error); // jika register error
    }
}
 
// FITUR LOGIN
export const Login = async(req, res) => {
    try {
        const user = await Users.findAll({ // mencari semua email yang cocok dengan input user
            where:{
                email: req.body.email
            }
        });
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if(!match) return res.status(400).json({message: "Wrong Password"}); // cek apakah password sudah sesuai
        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;
        const role = user[0].role;
        const phone = user[0].phone;
        const address = user[0].address;
        const image_user = user[0].image_user;
        const visa = user[0].visa;
        const passport = user[0].passport;
        const izin = user[0].izin;
        // untuk membuat accses token
        const accessToken = jwt.sign({userId, name, email, role, phone, address, image_user, visa, passport,izin}, process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: '1d'
        });
         // untuk membuat refresh token
        const refreshToken = jwt.sign({userId, name, email, role, phone, address, image_user,visa, passport,izin}, process.env.REFRESH_TOKEN_SECRET,{
            expiresIn: '183d'
        });
        await Users.update({refresh_token: refreshToken},{ // mengupdate refresh token saat update
            where:{
                id: userId
            }
        });
        res.cookie('refreshToken', refreshToken,{ // disimpan kedalam cookie
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        const data = {
            userId,
            email,
            role,
            phone,
            address,
            accessToken,
            refreshToken,
        };
        return res.status(201).json({ //jika login berhasil
            success: true,
            message: "Login Successfully",
            data: data,
        });
    } catch (error) {
        res.status(404).json({message:"Email tidak ditemukan"}); // jika email salah/tidak sesuai
    }
}

//FITUR CEK PROFILE USER
export const Whoami = async (req, res) => {
    try {
        const users = await Users.findOne({ // Mencari user yang sedang login
            where:{
              id: req.user.userId
            },
            attributes:['image_user','name','email', 'role','phone','address','visa','passport','izin'] // menampilkan atribut
        });
        res.json(users); // Response berupa json
    } catch (error) {
        console.log(error);
    }
}

// FITUR UPDATE PROFILE
export const Update = async(req, res,next) => {

  if(req.files === null) return res.status(400).json({message: "No File Uploaded"}); // jiga tidak ada file yang diupload
  // Mencari pengguna berdasarkan ID pengguna yang sedang login.
  const users = await Users.findOne({
    where: {
        id: req.user.userId
    }
  });
  const {name, phone, address} = req.body; // Atribut untuk input user
  // Untuk menyimpan file yang diunggah
  let fileName = "";
  let fileNameVisa = "";
  let fileNamePassport = "";
  let fileNameIzin = "";
  //Mengecek apakah tidak ada file yang diunggah melalui req.file. Jika tidak ada, maka menggunakan nama file yang ada pada pengguna yang sedang login.
  if(req.file === null){
    fileName = req.user.image_user;
    fileNameVisa = req.user.visa;
    fileNamePassport = req.user.passport;
    fileNameIzin = req.user.izin;
  }else{
    // Jika ada file yang diunggah, mendapatkan informasi file dan mengatur nama file yang unik dengan menggabungkan hash md5, angka acak, dan ekstensi file.
    const file = req.files.image_user;
    const fileVisa = req.files.visa;
    const filePassport = req.files.passport;
    const fileIzin = req.files.izin;

    const fileSize = file.data.length;
    const fileSizeVisa = fileVisa.data.length;
    const fileSizePassport = filePassport.data.length;
    const fileSizeIzin = fileIzin.data.length;
    
    const ext = path.extname(file.name);
    const extVisa = path.extname(fileVisa.name);
    const extPassport = path.extname(filePassport.name);
    const extIzin = path.extname(fileIzin.name);

    const rand =Math.random()*10+1+"wr" 

    fileName = file.md5 +rand+ ext;
    fileNameVisa = fileVisa.md5+rand + extVisa;
    fileNamePassport = filePassport.md5+rand + extPassport;
    fileNameIzin = fileIzin.md5+rand+ extIzin;
    // Mengecek tipe file yang diunggah, memastikan hanya file gambar dengan tipe .png, .jpg, atau .jpeg yang diperbolehkan.
    const allowedType = ['.png','.jpg','.jpeg'];
    if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({message: "Invalid Images"});
    if(!allowedType.includes(extVisa.toLowerCase())) return res.status(422).json({message: "Invalid Images"});
    if(!allowedType.includes(extPassport.toLowerCase())) return res.status(422).json({message: "Invalid Images"});
    if(!allowedType.includes(extIzin.toLowerCase())) return res.status(422).json({message: "Invalid Images"});
    
    // Mengecek ukuran file yang diunggah, memastikan ukuran file kurang dari 1 MB.
    if(fileSize > 1000000 || fileSizeVisa > 1000000 || fileSizePassport > 1000000 || fileSizeIzin > 1000000) return res.status(422).json({message: "Image must be less than 1 MB"});
    // Memindahkan file ke direktori yang sesuai dan error handling
    file.mv(`./public/images/${fileName}`, (err)=>{
        if(err) return res.status(500).json({message: err.message});
    });
    fileVisa.mv(`./public/images/${fileNameVisa}`, (err)=>{
      if(err) return res.status(500).json({message: err.message});
    });
    filePassport.mv(`./public/images/${fileNamePassport}`, (err)=>{
      if(err) return res.status(500).json({message: err.message});
    });
    fileIzin.mv(`./public/images/${fileNameIzin}`, (err)=>{
      if(err) return res.status(500).json({message: err.message});
    });
  }
  // Membuat URL yang menunjukkan lokasi file yang diunggah.
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
  const urlVisa = `${req.protocol}://${req.get("host")}/images/${fileNameVisa}`;
  const urlPassport = `${req.protocol}://${req.get("host")}/images/${fileNamePassport}`;
  const urlIzin = `${req.protocol}://${req.get("host")}/images/${fileNameIzin}`;
  try {
    // Menggunakan metode update pada model Users untuk mengupdate data pengguna dengan nilai yang diperbarui, termasuk URL gambar yang telah diunggah.
    await Users.update({
      name: name,
      phone: phone,
      address: address,
      visa: urlVisa,
      passport: urlPassport,
      izin: urlIzin,
      image_user: url,
  },{
      where:{
          id: users.id
      }
      
  });
  // Mengirim respons dengan status 200 dan pesan "User Updated" jika pengguna berhasil diperbarui.
  res.status(200).json({message: "User Updated"});
  } catch (error) {
    console.log(error); // Jika terjadi error
  }return next; // Melanjutkan eksekusi middleware berikutnya.

}
// FUNGSI UNTUK LOGOUT
export const Logout = async(req, res) => {
  // Mengambil refreshToken dari cookies pada request.
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) return res.sendStatus(204); // Jika tidak ada token
    // Mencari pengguna berdasarkan refresh_token yang sesuai dengan refreshToken yang diberikan. Jika tidak ditemukan pengguna dengan refresh_token tersebut, mengembalikan respons status 204.
    const user = await Users.findAll({
        where:{
            refresh_token: refreshToken
        }
    });
    if(!user[0]) return res.sendStatus(204);
    const userId = user[0].id; // Mendapatkan userId dari user yang ditemukan
    // Mengupdate kolom refresh_token menjadi null pada pengguna dengan id yang sesuai dengan userId yang ditemukan.
    await Users.update({refresh_token: null},{
        where:{
            id: userId
        }
    });
    // Menghapus cookie dengan nama refreshToken.
    res.clearCookie('refreshToken');
    // Mengembalikan respons status 200 (OK).
    return res.sendStatus(200);
}