import {Router} from "express";
import pool from "../db.js";

const router = Router();

router.get("/", async(_req, res) => {
    try{
        const [rows] = await pool.query(
            `
            SELECT
            p.Product_ID, p.Product_Name, p.Brand, p.Image_URL,
            v.Variant_ID, v.Colour, v.Size, v.Price
            FROM product p
            LEFT JOIN variant v ON v.Product_ID = p.Product_ID
            ORDER BY p.Product_ID ASC, v.Variant_ID ASC
            `
        );

        const grouped = Object.create(null);

        for(const r of rows){
            const pid = r.Product_ID;
            if(!grouped[pid]){
                grouped[pid] =  {
                    Product_ID: pid,
                    Product_Name: r.Product_Name,
                    Brand: r.Brand,
                    Image_URL: r.Image_URL, 
                    Variants: [],
                };
                
            }

            if(r.Variant_ID != null){
                grouped[pid].Variants.push({
                    Variant_ID: r.Variant_ID,
                    Colour: r.Colour,
                    Size: r.Size,                       
                    Price: r.Price == null? null : Number(r.Price),
                });                
            }
        }
        console.log(grouped);
        
       res.json(Object.values(grouped));
    } 
    catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Failed to fetch products" });    
    }

    
    
});

export default router;