import product from "../models/ProductModel.js";
import path from "path";
import fs from "fs";

// Berisi fungsi untuk mencari semua produk/data tiket pada db
export const getproduct = async(req, res) => {
    try {
        const response = await product.findAll({ // mencari semua produk dan menampilkan atributnya
            attributes:['id','jenis_penerbangan','bentuk_penerbangan','kota_asal','bandara_asal','kota_tujuan','bandara_tujuan','depature_date','depature_time','kode_negara_asal','kode_negara_tujuan', 'price','kota_asal_','bandara_asal_','kota_tujuan_','bandara_tujuan_','depature_date_','depature_time_','kode_negara_asal_','kode_negara_tujuan_','price_','total_price','image_product','image_product_id','desctiption','createdAt','updatedAt']
        });
        res.json(response); // respon berupa json
    } catch (error) {
        console.log(error); // jika terjadi error
    }
}

// Berisi fungsi untuk produk sesuai dengan id
export const getproductById = async(req, res) => {
    const { id } = req.params; // id diambil dari params
    const Product = await product.findOne({ // hanya mencari satu id
        where: { id: id }, // dengan kodisi id = id
    });
    if (!Product){ // kondisi jika tidak ada produk
        return res.status(404).json({
            success: true,
            message: "Tidak ada tiket",
        });
    }
    res.json(Product); // respon berupa json
}

// Fungsi untuk ceate produk/tiket
export const createproduct = async(req, res) => {
    // mengecek role user yang mengakses
    if(req.user.role !== "admin") {
        return res.status(400).json({
            success: false,
            message: "Kamu gak bisa nambah tiket dengan role member",
        });
    }
    if(req.files === null) return res.status(400).json({message: "No File Uploaded"}); // jika tidak ada file yang di upload
    const { jenis_penerbangan,bentuk_penerbangan,kota_asal,bandara_asal,kota_tujuan,bandara_tujuan,depature_date,depature_time,kode_negara_asal, kode_negara_tujuan,price,kota_asal_,bandara_asal_,kota_tujuan_,bandara_tujuan_,depature_date_,depature_time_,kode_negara_asal_,kode_negara_tujuan_,price_,total_price,desctiption} = req.body; // atribut pada req body(untuk input data)
    const file = req.files.image_product; // file foto
    const fileSize = file.data.length; // file size
    const ext = path.extname(file.name); // extension/format file jpg/png
    const rand =Math.random()*10+1+"wr"  // random string
    const fileName = file.md5 +rand+ ext; // format filename di database jika di upload
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`; // format link url image
    const allowedType = ['.png','.jpg','.jpeg']; // format gambar yang di setujui

    if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({message: "Invalid Images"}); // cek format file
    if(fileSize > 5000000) return res.status(422).json({message: "Image must be less than 5 MB"}); // cek size file
    
    // peletakan gambar pada database
    file.mv(`./public/images/${fileName}`, async(err)=>{
        if(err) return res.status(500).json({message: err.message});
        try {
            await product.create({jenis_penerbangan: jenis_penerbangan,bentuk_penerbangan: bentuk_penerbangan,kota_asal: kota_asal,bandara_asal: bandara_asal,kota_tujuan: kota_tujuan,bandara_tujuan: bandara_tujuan,depature_date: depature_date, depature_time: depature_time,kode_negara_asal: kode_negara_asal,kode_negara_tujuan:kode_negara_tujuan, price: price,kota_asal_: kota_asal_,bandara_asal_: bandara_asal_,kota_tujuan_: kota_tujuan_,bandara_tujuan_: bandara_tujuan_,depature_date_: depature_date_,depature_time_: depature_time_,kode_negara_asal_: kode_negara_asal_,kode_negara_tujuan_: kode_negara_tujuan_,price_: price_,total_price: total_price,image_product: url,image_product_id: fileName,desctiption: desctiption});
            return res.status(200).json({ // jika berhasil di create
                success: true,
                message: "tiket Berhasil ditambahkan",
            });
        } catch (error) {
            console.log(error); // jika ada error
        }
    })
}

// fungsi untuk mengupdate tiket
export const updateproduct = async(req, res) => {
    if(req.files === null) return res.status(400).json({message: "No File Uploaded"}); // jika tidak ada file yang di upload
    const { id } = req.params;
    const Product = await product.findOne({ // mencari satu tiket sesuai dengan id params
        where: { id: id },
    });
    let fileName = "";
    if (!Product){ // jika tiket yang dicari tidak ada
        return res.status(404).json({
            success: true,
            message: "Tidak ada tiket",
        });
    }
    const { jenis_penerbangan,bentuk_penerbangan,kota_asal,bandara_asal,kota_tujuan,bandara_tujuan,depature_date,depature_time,kode_negara_asal, kode_negara_tujuan,price,kota_asal_,bandara_asal_,kota_tujuan_,bandara_tujuan_,depature_date_,depature_time_,kode_negara_asal_,kode_negara_tujuan_,price_,total_price,desctiption} = req.body; // atribut untuk input
    // cek role
    if(req.user.role !== "admin" ) {
        return res.status(400).json({
            success: false,
            message: "Kamu gak bisa update data product dengan role member",
        });
    }
    // kurang lebih mirip dengan fitur mebuat tiket, perbedaannya ada di line 114 product.update yaitu untuk mengupdate product
    if(req.files === null){
        fileName = product.image_product;
    }else {
        const file = req.files.image_product;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const rand =Math.random()*10+1+"wr" 
        fileName = file.md5 +rand+ ext;
        const allowedType = ['.png','.jpg','.jpeg'];

        if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({message: "Invalid Images"});
        if(fileSize > 5000000) return res.status(422).json({message: "Image must be less than 5 MB"});

        // const filepath = `./public/images/${product.image_product_id}`;
        // fs.unlinkSync(filepath);

        file.mv(`./public/images/${fileName}`, (err)=>{
            if(err) return res.status(500).json({message: err.message});
        });
    }
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    try {
        await product.update({ jenis_penerbangan: jenis_penerbangan,bentuk_penerbangan: bentuk_penerbangan,kota_asal: kota_asal,bandara_asal: bandara_asal,kota_tujuan: kota_tujuan,bandara_tujuan: bandara_tujuan,depature_date: depature_date, depature_time: depature_time,kode_negara_asal: kode_negara_asal, kode_negara_tujuan: kode_negara_tujuan,price: price,kota_asal_: kota_asal_,bandara_asal_: bandara_asal_,kota_tujuan_: kota_tujuan_,bandara_tujuan_: bandara_tujuan_,depature_date_: depature_date_,depature_time_: depature_time_,kode_negara_asal_: kode_negara_asal_,kode_negara_tujuan_: kode_negara_tujuan_,price_:price_,total_price: total_price,image_product: url,image_product_id: fileName,desctiption: desctiption},
        {
            where: { id: id},
        });
        return res.status(200).json({
            success: true,
            message: "product Berhasil diupdate",
        });
    } catch (error) {
        console.log(error);
    }
}
// fungsi untuk menghapus data tiket berdasarkan id tiket
export const deleteproduct = async(req, res) => {
    const { id } = req.params;
    // mencari data tiket
    const dataBeforeDelete = await product.findOne({
    where: { id: id },
    });
    if (!dataBeforeDelete){ // cek apakah tiketnya ada
        return res.status(404).json({
            success: true,
            message: "Tidak ada tiket",
        });
    }
    if(req.user.role !== "admin" ) { // cek role
        return res.status(400).json({
            success: false,
            message: "Kamu gak bisa mengakses ini",
        });
    }
    const parsedDataProfile = JSON.parse(JSON.stringify(dataBeforeDelete)); // parse tiket

    if (!parsedDataProfile) { 
        return res.status(400).json({
            success: false,
            message: "product doesn't exist or has been deleted!",
        });
    }
    try {
        // const filepath = `./public/images/${product.image_product_id}`; 
        // fs.unlinkSync(filepath);
        await product.destroy({ //  Menghapus tiket
            where: { id },
        });
        return res.status(200).json({ // Respon jika berhasil
            success: true,
            message: "Delete Data Successfully",
        });
    } catch (error) {
        console.log(error);
    }
}