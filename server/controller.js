let nextEmp = 5
let dotenv = require("dotenv").config()
let {CONNECTION_STRING, SERVER_PORT} = dotenv
let Sequelize = require("sequelize")

const sequelize = new Sequelize("postgres://zuwvycsoltavdx:47c06740c00ce7fec09513154e38f7e3c897ca6ad693c8607db2f09c23580fa8@ec2-23-23-151-191.compute-1.amazonaws.com:5432/d5m4uq15ek5hg7", {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
})

module.exports = {
    getUpcomingAppointments: (req, res) => {
        sequelize.query(`select a.appt_id, a.date, a.service_type, a.approved, a.completed, u.first_name, u.last_name 
        from cc_appointments a
        join cc_emp_appts ea on a.appt_id = ea.appt_id
        join cc_employees e on e.emp_id = ea.emp_id
        join cc_users u on e.user_id = u.user_id
        where a.approved = true and a.completed = false
        order by a.date desc;`)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },

    approveAppointment: (req, res) => {
        let {apptId} = req.body
    
        sequelize.query(`UPDATE cc_appointments
        SET approved = true
        WHERE cc_appointments.appt_id = ${apptId};
        
        insert into cc_emp_appts (emp_id, appt_id)
        values (${nextEmp}, ${apptId}),
        (${nextEmp + 1}, ${apptId});
        `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
                nextEmp += 2
            })
            .catch(err => console.log(err))
    },

    getAllClients: (req, res) => {
        sequelize.query('SELECT * FROM cc_users JOIN cc_clients ON cc_users.user_id = cc_clients.user_id')
        .then( dbRes => res.status(200).send(dbRes[0]))
    },

    getPendingAppointments: (req, res) => {
        sequelize.query('SELECT * FROM cc_appointments WHERE approved = false ORDER BY date ASC')
        .then(dbRes => res.status(200).send(dbRes[0]))
    },

    getPastAppointments: (req, res) => {
        sequelize.query(`SELECT a.appt_id, a.date, a.service_type, a.notes, b.first_name, b.last_name
        FROM cc_appointments a
        JOIN cc_users b ON a.client_id = b.user_id
        WHERE a.approved = true AND a.completed = true
        ORDER BY a.date ASC`)
        .then(dbRes => res.status(200).send(dbRes[0]))
    },

    completeAppointment: (req, res) => {
        sequelize.query(`UPDATE cc_appointments
        SET completed = true
        WHERE appt_id = ${req.body}`)
        .then(dbRes => { res.status(200).send(dbRes[0])})
    }
}
