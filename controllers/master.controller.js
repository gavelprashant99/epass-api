const connection = require("../config/mysqldb");
const express = require("express");
const router = express.Router();
const {check, validationResult} = require("express-validator");

const operations = [];


// get distt
operations['get_districts'] = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(), "status": 400
        });
    }
    try {
        return new Promise((resolve, reject) => {
            let sql = "SELECT d.LGD_CODE `distt_lgd_code`,d.District_ID `distt_id`,d.District_Name `distt_name_hin`," +
                "d.DBStart_Name_En `distt_name_en` FROM master_districts d ORDER BY d.DBStart_Name_En ASC"
            connection.query(sql, function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(res.json(result));
                }
            });
        });
    } catch (e) {
        console.log(e);
        res.send({message: "Error in Fetching Data"});
    }
};

// get blocks and panchayat
operations['get_blocks_panchayat_gram'] = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(), "status": 400
        });
    }
    let distt_lgd_code = req.params.distt_lgd_code == undefined ? 0 : req.params.distt_lgd_code;
    let block_lgd_code = req.params.block_lgd_code == undefined ? 0 : req.params.block_lgd_code;
    let std_panchayat_code = req.params.std_panchayat_code == undefined ? 0 : req.params.std_panchayat_code;
    let sql = "";
    let whereData = [];
    // console.log(distt_lgd_code+"/"+block_lgd_code);
    try {
        if (distt_lgd_code > 0 && block_lgd_code > 0 && std_panchayat_code > 0) {
            sql = "SELECT v.LGD_BlockCode block_lgd_code, v.Std_Panchayat_Code std_panchayat_code, v.Std_Village_Code std_village_code, "
                + "v.LGD_VillageCode village_lgd_code, v.LGD_Census2001Code census_2001_code, v.LGD_Census2011Code census_2011_code, "
                + "v.Village_Name village_name_hin, v.Village_Name_En village_name_eng "
                + "FROM master_villages v "
                + "WHERE v.LGD_DistrictCode =? AND v.Std_Block_Code = ? AND v.Std_Panchayat_Code =? ORDER BY v.Village_Name ASC ";
            whereData = [distt_lgd_code, block_lgd_code, std_panchayat_code];
        } else if (distt_lgd_code > 0 && block_lgd_code > 0) {
            sql = "SELECT p.LGD_BlockCode block_lgd_code, p.Std_Panchayat_Code std_panchayat_code, p.Gram_Panchayat_Hi panchayat_hin, "
                + "p.Gram_Panchayat_En panchayat_en FROM master_panchayats p WHERE p.LGD_DistrictCode = ? AND p.Std_Block_Code = ? order by p.Gram_Panchayat_Hi ASC";
            whereData = [distt_lgd_code, block_lgd_code];
        } else if (distt_lgd_code > 0) {
            sql = "SELECT b.Std_Block_Code std_block_code ,b.LGD_BlockCode block_lgd_code,b.Block_Name `block_name_hin`,b.Block_Name_En `block_name_en`"
                + " FROM master_blocks b where b.LGD_DistrictCode=? order by b.Block_Name_En ASC ";
            whereData = [distt_lgd_code];
        }

        if (distt_lgd_code > 0 || block_lgd_code > 0) {
            return new Promise((resolve, reject) => {
                connection.query(sql, whereData, function (error, result) {
                    if (error) {
                        reject(error);
                    } else {
                        if (result.length > 0) {
                            resolve(res.json(result));
                        } else {
                            resolve(res.send({message: "No Data found"}));
                        }
                    }
                });
            });
        } else {
            res.send({message: "Data missing"});
        }
    } catch (e) {
        console.log(e);
        res.send({message: "Error in Fetching"});
    }
};

// get nagars and wards
operations['get_nagar_ward_colony'] = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(), "status": 400
        });
    }
    let distt_lgd_code = req.params.distt_lgd_code == undefined ? 0 : req.params.distt_lgd_code;
    let std_town_code = req.params.std_town_code == undefined ? 0 : req.params.std_town_code;
    let ward_no = req.params.ward_no == undefined ? 0 : req.params.ward_no;
    let sql = "";
    let nnn_type = req.params.nnn_type == undefined ? 0 : req.params.nnn_type;
    console.log(nnn_type);
    let whereData = [];
    // console.log(distt_lgd_code+"/"+std_town_code);
    try {
        if(distt_lgd_code > 0 && std_town_code > 0 && ward_no > 0){
            sql = "SELECT id as colony_id, district_lgd distt_lgd_code, std_nnn_code std_town_code, colony as colony_name FROM `master_colony_suda` "
                +" where district_lgd = ? AND std_nnn_code = ? AND ward =?";
            whereData = [distt_lgd_code, std_town_code, ward_no];
        }
        else if (distt_lgd_code > 0 && std_town_code > 0) {
            // sql = "SELECT d.LGD_CODE distt_lgd_code, w.Std_Town_Code std_town_code, w.Ward_No ward_no, w.Ward_Name ward_name_hin"
            //     + " FROM master_nagriya_wards w"
            //     + " INNER JOIN master_districts d ON w.Dist_ID = d.District_ID"
            //     + " WHERE d.LGD_CODE= ? AND w.Std_Town_Code = ?"; // old code
            sql = "SELECT d.LGD_CODE distt_lgd_code, w.nagar_code std_town_code, w.ward_no ward_no, w.ward_name_hin ward_name_hin,w.ward_name_eng ward_name_eng"
                + " FROM master_nagar_ward_suda w"
                + " INNER JOIN master_districts d ON w.district_id = d.District_ID"
                + " WHERE d.LGD_CODE= ? AND w.nagar_code = ? order by w.ward_no ASC";
            whereData = [distt_lgd_code, std_town_code];
        } else if (distt_lgd_code > 0) {
            // sql = "SELECT d.LGD_CODE distt_lgd_code, n.Std_NNN_Code std_town_code, n.NNN_Name nagar_name_hin, n.nnn_type, "
            //     + " n.NNN_Name_En nagar_name_en FROM master_nagriya_nikay n"
            //     + " INNER JOIN master_districts d ON n.Dist_ID = d.District_ID"
            //     + " WHERE d.LGD_CODE = ? AND n.NNN_type= ?"; // old code 
            let condition ="";
            if(nnn_type!=1)
                condition = " AND n.nagar_type =? ";
            sql = "SELECT d.LGD_CODE distt_lgd_code, n.nagar_code std_town_code,n.nagar_name_hin nagar_name_hin, n.nagar_type, "
                + " n.nagar_name_eng nagar_name_en  FROM master_nagar_suda n"
                + " INNER JOIN master_districts d ON n.district_id = d.District_ID"
                + " WHERE d.LGD_CODE = ?"+condition+"order by n.nagar_name_eng ASC";
            whereData = [distt_lgd_code, nnn_type];
        }

        console.log(sql);

        if (distt_lgd_code > 0 || std_town_code > 0) {
            return new Promise((resolve, reject) => {
                connection.query(sql, whereData, function (error, result) {
                    if (error)
                        reject(error);
                    else {
                        if (result.length > 0) {
                            resolve(res.json(result));
                        } else {
                            resolve(res.send({message: "No Data found"}));
                        }
                    }
                });
            });
        } else {
            res.send({message: "Data missing"});
        }
    } catch (e) {
        console.log(e);
        res.send({message: "Error in Fetching"});
    }
};

// get Tehsil (Sub District) - For Revenue Dept.
operations['get_tehsil_by_district'] = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(), "status": 400
        });
    }
    let distt_lgd_code = req.params.distt_lgd_code == undefined ? 0 : req.params.distt_lgd_code;
    let sql = "";
    let whereData = [];
    let condition = "";
    // console.log(distt_lgd_code+"/"+block_lgd_code);
    try {
        if (distt_lgd_code > 0) {
            condition += ` WHERE mvn.district_code = ?  `;
            whereData = [distt_lgd_code];
        }
        sql = `SELECT mvn.district_code    distCode,
                      mvn.subdistrict_code subDistCode,
                      mvn.subdistrict_name subDistName
               FROM master_villages_new mvn
        ` + condition + `
            GROUP BY mvn.district_code, mvn.subdistrict_code,mvn.subdistrict_name`;

        return new Promise((resolve, reject) => {
            connection.query(sql, whereData, function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    if (result.length > 0) {
                        resolve(res.json(result));
                    } else {
                        resolve(res.send({message: "No Data found"}));
                    }
                }
            });
        });
    } catch (e) {
        console.log(e);
        res.send({message: "Error in Fetching"});
    }
};

// get Tehsil (Sub District) - For Revenue Dept.
operations['get_village_by_tehsil'] = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(), "status": 400
        });
    }
    let subdist_code = req.params.subdist_code == undefined ? 0 : req.params.subdist_code;
    let sql = "";
    let whereData = [];
    let condition = "";
    // console.log(distt_lgd_code+"/"+block_lgd_code);
    try {
        if (subdist_code > 0) {
            condition += ` WHERE mvn.subdistrict_code = ? `;
            whereData = [subdist_code];
        }
        sql = `SELECT mvn.district_code   distCode,
                      mvn.village_code    villageCode,
                      mvn.village_name_en villNameEng,
                      mvn.village_name_hi
               FROM master_villages_new mvn
        ` + condition + ``;

        return new Promise((resolve, reject) => {
            connection.query(sql, whereData, function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    if (result.length > 0) {
                        resolve(res.json(result));
                    } else {
                        resolve(res.send({message: "No Data found"}));
                    }
                }
            });
        });
    } catch (e) {
        console.log(e);
        res.send({message: "Error in Fetching"});
    }
};


operations['get_departments'] = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(), "status": 400
        });
    }
    try {
        return new Promise((resolve, reject) => {
            let sql = "SELECT md.dept_id AS id, md.dept_name_hi AS deptNameHi, md.dept_name_eng AS deptNameEn FROM master_departments md ;"
            connection.query(sql, function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(res.json(result));
                }
            });
        });
    } catch (e) {
        console.log(e);
        res.send({message: "Error in Fetching Data"});
    }
};

operations['get_master_complaint_types'] = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(), "status": 400
        });
    }
    let dept_id = req.params.dept_id == undefined ? 0 : req.params.dept_id;
    let comp_category_code = req.params.comp_category_code == undefined ? 0 : req.params.comp_category_code;
    let condition = "";
    let whereData = [];
    try {
        return new Promise((resolve, reject) => {
            if (dept_id > 0) {
                if (comp_category_code > 0) {
                    condition = "WHERE mct.fk_master_dept_id = ? AND mct.complain_category_code = ?";
                    whereData = [dept_id, comp_category_code];
                } else {
                    condition = "WHERE mct.fk_master_dept_id = ?";
                    whereData = [dept_id];
                }
                let sql = "SELECT mct.id, mct.complaint_type, mct.complaint_type_hindi, mct.cmpt_code, mct.complaint_category, "
                    + "mct.complain_category_code, mct.complaint_sub_type, mct.complaint_sub_type_hindi, mct.cmpt_sub_code "
                    + "FROM "
                    + "master_complaint_types mct " + condition;
                
                connection.query(sql, whereData, function (error, result) {
                    if (error) {
                        reject(error);
                    } else {
                        let returnData = {};
                        result.forEach(function (obj, index) {

                                if(returnData.hasOwnProperty(obj.cmpt_code)){
                                    returnData[obj.cmpt_code].complaint_sub_type.push({
                                        "id": obj.id,
                                        "complaint_sub_type": obj.complaint_sub_type,
                                        "complaint_sub_type_hindi": obj.complaint_sub_type_hindi,
                                        "cmpt_sub_code": obj.cmpt_sub_code
                                    });
                                }else{
                                    returnData[obj.cmpt_code] = {
                                        "complaint_type": obj.complaint_type,
                                        "complaint_type_hindi": obj.complaint_type_hindi,
                                        "complaint_code": obj.cmpt_code,
                                        "complaint_category": obj.complaint_category,
                                        "complaint_sub_type": [
                                            {
                                                "id": obj.id,
                                                "complaint_sub_type": obj.complaint_sub_type,
                                                "complaint_sub_type_hindi": obj.complaint_sub_type_hindi,
                                                "cmpt_sub_code": obj.cmpt_sub_code
                                            }
                                        ]
                                    };
                                }

                        });
                        resolve(Object.values(returnData));
                    }
                });
            } else {
                res.send({message: "Data missing"});
            }

        });
    } catch (e) {
        console.log(e);
        res.send({message: "Error in Fetching Data"});
    }
};


operations['get_master_complaint_sub_types'] = (req, res, complaint_type, complaint_code) => {
    console.log("compType" + complaint_type);
    console.log("complaintCode" + complaint_code)
    let whereData = [];
    let condition = [];
    let complaintCode = complaint_code == undefined ? 0 : complaint_code;
    try {
        return new Promise((resolve, reject) => {

            if (complaintCode == 0) {
                condition = "WHERE mct.complaint_type = ?";
                whereData = [complaint_type];
            } else {
                condition = "WHERE mct.complaint_type = ? and mct.complain_category_code = ?";
                whereData = [complaint_type, complaintCode];
            }

            let sql = "SELECT mct.id,  mct.complaint_sub_type, mct.complaint_sub_type_hindi, mct.cmpt_sub_code FROM master_complaint_types mct " + condition + " ";

            connection.query(sql, whereData, function (error, result) {
                console.log(sql);
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    } catch (e) {
        console.log(e);
    }
};

module.exports = operations;
