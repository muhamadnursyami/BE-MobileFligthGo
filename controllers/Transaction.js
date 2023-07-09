import transaction from "../models/TransactionModel.js";
import product from "../models/ProductModel.js";
import Users from "../models/UserModel.js";
import path from "path";
import fs from "fs";
// Fungsi untuk membuat transaksi baru
export const cereateTransaction = async(req, res) => {
    try {
        // Memeriksa role user jika ia adalah admin maka tidak bisa melakukan transaksi
        if(req.user.role == "admin") {
            return res.status(400).json({
                success: false,
                message: "Kamu adalah admin tidak bisa transaksi",
            });
        }else{
            // Memeriksa apakah ada file yang diunggah. Jika tidak ada, mengembalikan respons dengan status 400 dan pesan yang menyatakan bahwa tidak ada file yang diunggah.
            if(req.files === null) return res.status(400).json({message: "No File Uploaded"});
            // Mendapatkan file dan informasi terkait dari permintaan. Mengecek jenis file yang diunggah dan ukuran filenya.
            const file = req.files.bukti_Pembayaran;
            const fileSize = file.data.length;
            const ext = path.extname(file.name);
            const rand =Math.random()*10+1+"wr" 
            const fileName = file.md5 +rand+ ext;
            const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
            // Mengecek jenis file yang diunggah apakah valid. Jika tidak valid, mengembalikan respons dengan status 422 dan pesan yang menyatakan bahwa jenis file tidak valid.
            const allowedType = ['.png','.jpg','.jpeg'];
            if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({message: "Invalid Images"});
            if(fileSize > 1000000) return res.status(422).json({message: "Image must be less than 5 MB"});
            // Memindahkan file yang diunggah ke lokasi yang ditentukan. Jika terjadi kesalahan dalam pemindahan file, mengembalikan respons dengan status 500 dan pesan yang menyatakan kesalahan yang terjadi.
            file.mv(`./public/images/${fileName}`, async(err)=>{
                if(err) return res.status(500).json({message: err.message});
                const Transaction = await transaction.create({
                    productId: req.params.id,
                    userId: req.user.userId,
                    bukti_Pembayaran: url,
                    userVisa: req.user.visa,
                    userPassport: req.user.passport,
                    userIzin: req.user.izin,
                    status: "menunggu",
                })
                console.log(req.user.role),
                // Mengembalikan respons dengan status 201, pesan yang mengindikasikan keberhasilan pemesanan, dan data transaksi yang dibuat.
                res.status(201).send({
                    status: 201,
                    message: 'Berhasil Memesan Silahkan menunggu',
                    data: Transaction
                })
            })

        }
    } catch (error) {
        // Hndling error yang terjadi dalam blok try. Mengembalikan respons dengan status 402 dan pesan yang berisi pesan kesalahan.
        res.status(402).json({
            status: "FAIL",
            message: error.message,
        });
    }
}
// FUNGSI UNTUK MENERIMA TRANSAKSI
export const accept = async(req, res) => {
    // Cek role, jika selain admin tidak bisa mengakses ini
    if(req.user.role !== "admin") {
        return res.status(400).json({
            success: false,
            message: "Kamu tidak bisa mengakses ini",
        });
    }
   try {
       //  Mencari transaksi dengan ID yang diberikan melalui request.
    const check = await transaction.findOne({
        where: {
            id: req.params.id,
        }
    })
    // Mengubah status transaksi menjadi "Pesanan Diterima" dengan menggunakan metode update pada objek transaksi yang ditemukan.
    const accept = await check.update({
        status:"Pesanan Diterima",
    })
    // Mengembalikan respons dengan status 201, pesan yang mengindikasikan bahwa pesanan telah diterima, dan data transaksi yang diperbarui.
    res.status(201).send({
        status: 201,
        message: 'Pesanan Diterima!',
        data: accept
    })
   } catch (error) { // Error handling
    res.status(400).send({
        status: "FAIL",
        message: error.message,
    })
   }
}
// FUNGSI UNTUK MENOLAK TRANSAKSI
export const reject = async(req, res) => {
    // Cek role, jika selain admin tidak bisa mengakses ini
    if(req.user.role !== "admin") {
        return res.status(400).json({
            success: false,
            message: "Kamu tidak bisa mengakses ini",
        });
    }
    try {
        //  Mencari transaksi dengan ID yang diberikan melalui request.
     const check = await transaction.findOne({
         where: {
             id: req.params.id,
         }
     })
     // Mengubah status transaksi menjadi "Pesanan Ditolak" dengan menggunakan metode update pada objek transaksi yang ditemukan.
     const reject = await check.update({
         status:"Pesanan Ditolak",
     })
     // Mengembalikan respons dengan status 201, pesan yang mengindikasikan bahwa pesanan telah ditolak, dan data transaksi yang diperbarui.
     res.status(201).send({
         status: 201,
         message: 'Pesanan Ditolak!',
         data: reject
     })
    } catch (error) { // Error handling
     res.status(400).send({
         status: "FAIL",
         message: error.message,
     })
    }
 }
 // FUNGSI UNTUK USER CHECK-IN
 export const checkIn = async (req, res) => {
    try {
        // const check = await transaction.findOne({
        //     where: {
        //         id: req.params.id,
        //     }
        // })
        // Mencari transaksi berdasarkan ID yang diberikan dan ID user yang sedang login. Jika tidak ditemukan, mengembalikan respons dengan status 401 dan pesan yang menyatakan bahwa pengguna tidak memiliki tiket ini.
        const sourceWishlist = await transaction.findOne({
            where: {
                userId: req.user.userId,
                id: req.params.id,
            }
        })
        if (!sourceWishlist) {
            res.status(401).send({
              status: "FAIL",
              message: "Anda tidak memiliki tiket ini",
            });
            return;
          }
          //  Mengupdate kolom checkIn pada transaksi dengan nilai yang diberikan melalui permintaan.
        const checkIn = await sourceWishlist.update({
            checkIn: req.body.checkIn,
        })
        // Mengembalikan respons dengan status 201, pesan yang mengindikasikan bahwa check-in berhasil dilakukan, dan data transaksi yang diperbarui.
        res.status(201).send({
            status: 201,
            message: 'Berhasil check in',
            data: checkIn
        })
       } catch (error) { // error handling
        res.status(400).send({
            status: "FAIL",
            message: error.message,
        })
       }
 }

 // FUNGSI UNTUK MENAMPIKAN SEMUA TRANSAKSI
 export const getTransactions = async (req, res) => {  // Cek Role user 
    if(req.user.role !== "admin") {
        return res.status(400).json({
            success: false,
            message: "Kamu gak bisa mengakses ini",
        });
    }
    try {
        // Mengambil semua transaksi yang ada, termasuk juga produk yang terkait dengan setiap transaksi, menggunakan metode findAll dengan opsi include.
        const sourceTransaction = await transaction.findAll({
            include: product
        })
        // Mengembalikan respons dengan status 201, menyertakan data transaksi yang ditemukan.
        res.status(201).send({
            status: 201,
            data: sourceTransaction
        })
    } catch (error) { // Error handling
        res.status(400).send({
            status: "FAIL",
            message: error.message,
        })
    }
}
// MENCARI TRANSAKSI BERDASARKAN ID
 export const getTransactionByID = async (req, res) => {
    try {
        // Mencari transaksi dengan ID yang sesuai menggunakan metode findOne dengan opsi where. Transaksi yang ditemukan juga akan menyertakan data produk terkait, karena menggunakan opsi include.
        const sourceTransaction = await transaction.findOne({
            where: {
                id: req.params.id
            },
            include: product
        })
        // Mengembalikan respons dengan status 201, menyertakan data transaksi yang ditemukan.
        res.status(201).send({
            status: 201,
            data: sourceTransaction
        })
    } catch (error) { // Error handling
        res.status(400).send({
            status: "FAIL",
            message: error.message,
        })
    }
}
// FUNGSI UNTUK MELIHAT HISTORY PERJALANAN
export const memberHistory = async (req, res) => {
    try {
        // Mencari transaksi berdasarkan ID pengguna (userId) dan status transaksi "Pesanan Diterima" menggunakan metode findAll dengan opsi where. Transaksi yang ditemukan juga akan menyertakan data produk terkait menggunakan opsi include.
        const memberHistory = await transaction.findAll({
            where: {
                userId: req.user.userId,
                status: "Pesanan Diterima",
            },
            include: {
                model: product
            }
        })
        // Mengembalikan respons dengan status 200 dan objek JSON yang berisi pesan "Success" dan riwayat transaksi anggota.
        res.status(200).json({
            message: "Success",
            memberHistory,
        });
    } catch (error) { // Error handling
        res.status(400).send({
            status: "FAIL",
            message: error.message,
        })
    }
}
// NOTIFIKASI UNTUK USER JIKA PESANAN DITERIMA ADMIN
export const NotificationIsAcc = async (req, res) => {
    try {
        // Mencari transaksi berdasarkan ID pengguna (userId) dan status transaksi "Pesanan Diterima" menggunakan metode findAll dengan opsi where. Transaksi yang ditemukan juga akan menyertakan data produk terkait menggunakan opsi include.
        const notifAcc = await transaction.findAll({
            where: {
                userId: req.user.userId,
                status: "Pesanan Diterima",
            },
            include: {
                model: product
            }
        })
        // Mengembalikan respons dengan status 200 dan objek JSON yang berisi pesan "Success" dan notifikasi transaksi yang telah diterima (notifAcc).
        res.status(200).json({
            message: "Success",
            notifAcc,
        });
    } catch (error) {
        res.status(400).send({
            status: "FAIL",
            message: error.message,
        })
    }
}
// NOTIFIKASI UNTUK USER JIKA PESANAN DITOLAK ADMIN
export const NotificationIsReject = async (req, res) => {
    try {
        // Mencari transaksi berdasarkan ID pengguna (userId) dan status transaksi "Pesanan Ditolak" menggunakan metode findAll dengan opsi where. Transaksi yang ditemukan juga akan menyertakan data produk terkait menggunakan opsi include.
        const notifReject = await transaction.findAll({
            where: {
                userId: req.user.userId,
                status: "Pesanan Ditolak",
            },
            include: {
                model: product
            }
        })
        // Mengembalikan respons dengan status 200 dan objek JSON yang berisi pesan "Success" dan notifikasi transaksi yang telah diterima (notifReject).
        res.status(200).json({
            message: "Success",
            notifReject,
        });
    } catch (error) {
        res.status(400).send({
            status: "FAIL",
            message: error.message,
        })
    }
}
// NOTIFIKASI UNTUK USER JIKA STATUS PESANAN MENUNGGU
export const NotificationIsOk = async (req, res) => {
    try {
        // Mencari transaksi berdasarkan ID pengguna (userId) dan status transaksi "menunggu" menggunakan metode findAll dengan opsi where. Transaksi yang ditemukan juga akan menyertakan data produk terkait menggunakan opsi include.
        const notifOk = await transaction.findAll({
            where: {
                userId: req.user.userId,
                status: "menunggu",
            },
            include: {
                model: product
            }
        })
        // Mengembalikan respons dengan status 200 dan objek JSON yang berisi pesan "Success" dan notifikasi transaksi yang masih dalam status "menunggu" (notifOk).
        res.status(200).json({
            message: "Success",
            notifOk,
        });
    } catch (error) {
        res.status(400).send({
            status: "FAIL",
            message: error.message,
        })
    }
}