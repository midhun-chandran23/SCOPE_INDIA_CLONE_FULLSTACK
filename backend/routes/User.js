const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const router = require("express").Router();
const RegisterModel = require('../models/register');
const LoginModel = require('../models/Login');
const CourseModel = require('../models/courses');

const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');

const { json } = require("express");


require("dotenv").config();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "../frontend/src/images/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + file.originalname)
    }
})

const upload = multer({ storage: storage })



//   router.get('/', (req, res) => {
//     if(req.session.user){
//         res.redirect('/getDashboard');
//     }else{
//         console.log("session not")
//     }
// });

router.post("/register", upload.single('image'), async (req, res) => {
    let fullname = req.body.fullname;
    let dob = req.body.dob;
    let gender = req.body.gender;
    let educationqualification = req.body.educationqualification;
    let course = req.body.course;
    let email = req.body.email;
    let mobilenumber = req.body.mobilenumber;
    let country = req.body.country;
    let state = req.body.state;
    let city = req.body.city;
    let image = req.file.filename;
    // let guardianMobile = req.body.guardianMobile
    // let guardianName = req.body.guardianName
    // let guardianOccupation = req.body.guardianOccupation
    // let address = req.body.address
    // let trainingMode = req.body.trainingMode
    // let location = req.body.location
    // let timings = req.body.timings
    // let zip = req.body.zip


    RegisterModel.findOne({ email: email }).then(async (data) => {
        if (!data) {
            RegisterModel.create({
                fullname: fullname,
                dob: dob,
                gender: gender,
                educationqualification: educationqualification,
                course: course,
                email: email,
                mobilenumber: mobilenumber,
                country: country,
                state: state,
                city: city,
               image: image,
            //    guardianMobile: guardianMobile,
            //    guardianName: guardianName,
            //    guardianOccupation: guardianOccupation,
            //    address: address,
            //    trainingMode: trainingMode,
            //    location: location,
            //    timings: timings,
            //    zip: zip
            }).then((result => {
                sendEmail(result.email);
                res.status(200).json({ message: "User Registered Successfully" })

            })).catch((err) => {
                res.status(400).json({ message: "Something went wrong", error: err })
            })
        } else {
            res.status(401).json({ message: "Email Already Exists" })

        }
    }).catch((err) => {
        res.status(400).json({ message: "Something went wrong", error: err })
    })
})

const sendEmail = async (email) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.PORT,
            service: process.env.SERVICE,
            secure: process.env.SECURE,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS
            }
        });
        let mailoptions = {
            from: 'midhun23332@gmail.com.com',
            to: email,
            subject: 'Greetings From ScopeIndia-Registration Confirmation',   
            text: 'Thank you for registering with us - Scoepe India !!!'
        };
        transporter.sendMail(mailoptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response)
            }
        })
    } catch (error) {
        res.status(400).json({ message: "email not sent" });
    }
}

function generateOTP(length) {
    const characters = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * characters.length);
        otp += characters[index];
    }
    return otp;
}

async function sendOTP(email, otp) {
    const BASE_URL = "http://localhost:3000"
    // const url = process.env.BASE_URL/verifyOTP;

    const url = `${BASE_URL}/verifyOTP`;

    try {
        let transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.PORT,
            service: process.env.SERVICE,
            secure: process.env.SECURE,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS
            }
        });

        let info = await transporter.sendMail({
            from: 'densyr987@gmail.com',
            to: email,
            subject: 'Your OTP for ScopeIndia Login Page',
            text: `Your OTP is ${otp}`,
            // html: `<p>Your OTP is <strong>${otp}</strong></p>,
            //      <p><a href="${url}">Verify OTP</a></p>`,
        });
        return info;

        console.log('Email sent: %s', info.messageId);

    } catch (error) {
        console.error('Error sending email:', error);
    }
}


router.post('/firsttimelogin', async (req, res) => {
    let email = req.body.email;
    try {

        const existingLogin = await LoginModel.findOne({ email: email });
        if (existingLogin) {

            const otp = generateOTP(4);
            sendOTP(email, otp);
            const updatedLogin = await LoginModel.findOneAndUpdate({ email: existingLogin.email }, { otp: otp },
                { new: true });

            console.log("Updated login:", updatedLogin);
            res.status(200).json({ message: "otp send through email", updatedLogin })

        } else {

            await RegisterModel.findOne({ email: email }).then(result => {
                if (result) {
                    let id = result._id;

                    const otp = generateOTP(4);
                    sendOTP(email, otp);

                    LoginModel.create({
                        email: email,
                        otp: otp,
                        register: result._id

                    }).then((result) => {
                        res.status(200).json({
                            message: "OTP sent through email",
                            user: result
                        })
                    }).catch((err) => {
                        console.error('Error:', err);
                        res.status(500).json({ message: 'Error while enter otp details in database' });
                    })
                } else {
                    res.status(400).json({ message: "Email not found in registration" })
                }
            })
        }

    } catch (error) {
        res.status(400).json({ message: "Something went wrong", error: error })

    }
})

router.post("/otpverify", async (req, res) => {
    console.log(req.body);
    let otp = req.body.otp;
    let email = req.body.email;
    try {
        const user = await LoginModel.findOneAndUpdate(
            { email: email, otp: otp },
            { new: true })
        if (!user) {
            res.status(403).json({
                message: "Invalid OTP or email"
            })
        }
        res.status(200).json({
            message: "OTP verified Successfully",
            user: user
        });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
})

router.post('/password-setting', async (req, res) => {
    console.log("req.body")
    console.log(req.body.email)
    let email = req.body.email;
    let newPassword = req.body.newPassword;
    let confirmPassword = req.body.confirmPassword;

    if (newPassword !== confirmPassword) {
        res.status(400).json({ message: "new password and cofirm password do not match" });
    } else {

        let hashedpassword = await bcrypt.hash(newPassword, 10);

        try {
            const result = await LoginModel.findOneAndUpdate({ email: email }, { password: hashedpassword }, { new: true });
            if (!result) {
                res.status(404).json({ message: "User not found" });
            }
            console.log("result:", result)
            res.status(200).json({ message: "Password Created successfully", user: result });


        } catch (err) {
            console.error("Error:", err);
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    }
})



// router.post('/login', async (req, res) => {
//     try {

//         const { email, password, keepLoggedIn } = req.body;
//         const result = await LoginModel.findOne({ email: email });
//         if (!result) {

//             return res.status(404).json({ message: 'User not found' });

//         }
//         let hashedpasswordmatch = await bcrypt.compare(password, result.password);
//         if (!hashedpasswordmatch) {
//             return res.status(403).json({ message:'Invalid username or password'  });
//         }
//         req.session.user=result.email;
//         if (keepLoggedIn) {
//            // req.session.user=result.email;
//             res.cookie('user', req.session.user,{ httpOnly: false, maxAge:10*60*60*1000,sameSite:'none'})
//             res.status(200).json({
//                 message: 'User Logged In successfully',
//                 user:req.session.user
//         });
//         }else if(!keepLoggedIn){
//        // req.session.user=result.email;
//         req.session.cookie.maxAge = 7*24*60*60*1000;
//             res.status(200).json({
//                 message: 'User Logged In successfully',
//                 user:req.session.user
//             });
//         }
//     } catch (err) {
//         if (err.message === 'Session has been expired') {
//             console.log(err);
//             return res.status(401).json({ message: 'Session expired. Please log in again.' });
//         } else {
//             return res.status(400).json({
//                 message: "Something went wrong",
//                 error: err.message
//             });
//         }
//     }

// })

router.post('/login', (req, res) => {

    const { email, password, keepLoggedIn } = req.body;
    LoginModel.findOne({ email: email }).then(async (result) => {
        if (result) {
            let hashedpasswordmatch = await bcrypt.compare(password, result.password);

            if (hashedpasswordmatch) {
                let token = jwt.sign({
                    _id: result._id,
                    email: result.email,
                }, process.env.JWT_KEY, { expiresIn: keepLoggedIn ? '10h' : '1h' });
                res.status(200).json({
                    message: 'User logged In successfully',
                    token: token,
                })
            } else {
                res.status(401).json({
                    message: "Password is incorrect"
                })
            }
        } else {
            res.status(404).json({
                message: "User Not found"

            })
        }
    }).catch((err) => {
        res.status(400).json({
            message: "Something went wrong",
            error: err
        })

    })
})


router.post("/getprofile", (req, res) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader) {
        res.status(403).json({
            message: "token not provided"
        })
    } else {
        const token = authHeader.split(' ')[1];
        try {

            let decodedvalue = jwt.verify(token, process.env.JWT_KEY)

            LoginModel.findOne({ _id: decodedvalue._id }).populate('register').then((userdata) => {
                if (userdata) {
                    console.log(userdata);
                    res.status(200).json(userdata)
                } else {
                    res.status(403).json({
                        message: "user not found"
                    })
                }
            }).catch((err) => {
                res.status(400).json({
                    message: "Something went wrong",
                    error: err
                })
            })

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                message: "Something went wrong",
                error: error
            });
        }
    }
});



router.post('/updateprofile', async (req, res) => {
    let token = req.body.token;
    if (!token) {
        res.status(403).json({
            message: "Token not provided"
        })
    } else {
        try {
            let decodedvalue = jwt.verify(token, process.env.JWT_KEY)
            let fullname = req.body.fullname ?? '';
            let mobilenumber = req.body.mobilenumber ?? '';
            let dob = req.body.dob ?? '';
            let course = req.body.course ?? '';
            let updateValue = {};
            if (fullname !== "") {
                updateValue.fullname = fullname;
            }
            if (mobilenumber !== "") {
                updateValue.mobilenumber = mobilenumber;
            }
            if (dob !== "") {
                updateValue.dob = dob;
            }
            if (course !== "") {
                updateValue.course = course;
            }
            if (Object.keys(updateValue).length > 0) {
                const loginDetails = await LoginModel.findOne({ _id: decodedvalue._id });

                if (!loginDetails) {
                    return res.status(404).json({ message: "User not found" });
                }

                await RegisterModel.updateOne({ _id: loginDetails.register }, updateValue);

                const updatedUser = await RegisterModel.findById(loginDetails.register);


                res.status(200).json({
                    message: "Profile updated successfully",
                    user: updatedUser
                });
            } else {
                res.status(403).json({
                    message: "Nothing to update"
                });
            }
        } catch (err) {
            res.status(400).json({
                message: "Something went wrong",
                error: err
            });
        }
    }
});


router.post('/checkpassword', async (req, res) => {
    const authHeader = req.headers.authorization;
    if(!authHeader){
        res.status(403).json({
            message:"token not provided"
        })
    }else{
        try {
            const token = authHeader.split(' ')[1];
            let decodedvalue=jwt.verify(token,process.env.JWT_KEY)
            let password = req.body.password ?? '';
            let newpassword = req.body.newpassword ?? '';
            if (password != '' && newpassword != '') {
                let user = await LoginModel.findOne({ _id:decodedvalue._id});
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
    
                }
    
                const passwordMatch = await bcrypt.compare(password, user.password);
                if (passwordMatch) {
                    const hashedNewPassword = await bcrypt.hash(newpassword, 10);
    
                    await LoginModel.updateOne({ _id:decodedvalue._id}, { password: hashedNewPassword });
    
                    res.status(200).json({ message: "Password updated successfully" });
    
                } else {
                    return res.status(402).json({
                        message: "old password does not matched"
                    })
                }
            } else {
                return res.status(400).json({ message: "Please provide both old and new passwords" });
            }
    
        } catch (err) {
            res.status(400).json({
                message: "Something went wrong",
                error: err
            })
        }
    }
   
})

router.get('/courses', async (req, res) => {
    try {
        const courses = await CourseModel.find();

        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.post('/addcourse', async (req, res) => {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(403).json({
            message: "Token not provided"
        })
    } else {
        try {
            const token = authHeader.split(' ')[1];
            let decodedvalue = jwt.verify(token, process.env.JWT_KEY)
            const selected_course = req.body.courses;
            const userdetails = await LoginModel.findOneAndUpdate(
                { _id: decodedvalue._id },
                { course: selected_course.map(course => course.name) },
                { new: true }
            );
            if (!userdetails) {
                return res.status(404).json({ message: "User not found" });
            }
            console.log("Updated user details:", userdetails);
            res.status(200).json({ message: "Course added successfully", userdetails });

        } catch (err) {
            res.status(400).json({
                message: "Something went wrong",
                error: err
            })

        }
    }
})

router.post('/getDashboard', async (req, res) => {
    console.log("dashboard");
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(403).json({
            message: "token not provided"
        })

    } else {
        try {
            const token = authHeader.split(' ')[1];
            console.log(token);
            let decodedvalue = jwt.verify(token, process.env.JWT_KEY)
            const userdetails = await LoginModel.findOne({ _id: decodedvalue._id }).populate('register');
            console.log(userdetails);
            res.status(200).json({ message: "Student Dashboard", userdetails });

        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    message: "Token expired",
                    error: err
                });
            } else {
                res.status(400).json({
                    message: "Something went wrong",
                    error: err
                })
            }


        }

    }
})

router.get('/courses/:name', async (req, res) => {
    try {
        const course = await CourseModel.findOne({ name: req.params.name });
        res.status(200).json({message:"course",course});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post('/courses/:courseId', async (req, res) => {
    console.log("courses")
    try {
      const courseId = req.params.courseId;
      console.log(courseId);
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      console.log(course);
      res.status(200).json({ message:"selected course",course});
     
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });














module.exports = router
