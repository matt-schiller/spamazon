const cTable = require('console.table');
const inquirer = require('inquirer');
const { Client } = require("pg");

const client = new Client({
	user: "pmpgvawcwugkuq",
	host: "ec2-23-21-162-90.compute-1.amazonaws.com",
	database: "d3486olermhop1",
	password: "b8e6ff8378e74ca4a2bcb81d99e816c387bbc51dcaba50037d7496f8c56dcc13",
	port: 5432,
	ssl: true
});
client.connect();

console.log(`
███████╗██████╗  █████╗ ███╗   ███╗ █████╗ ███████╗ ██████╗ ███╗   ██╗
██╔════╝██╔══██╗██╔══██╗████╗ ████║██╔══██╗╚══███╔╝██╔═══██╗████╗  ██║
███████╗██████╔╝███████║██╔████╔██║███████║  ███╔╝ ██║   ██║██╔██╗ ██║
╚════██║██╔═══╝ ██╔══██║██║╚██╔╝██║██╔══██║ ███╔╝  ██║   ██║██║╚██╗██║
███████║██║     ██║  ██║██║ ╚═╝ ██║██║  ██║███████╗╚██████╔╝██║ ╚████║
╚══════╝╚═╝     ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝
                                                                      
`);

selectAll();

function selectAll() {
	client.query(`SELECT * FROM products ORDER BY id`, function(error, response) {
		if (error) throw error;
		console.table(response.rows);
		// client.end();
		takeOrder();
	})
}

function takeOrder() {
	inquirer.prompt([
		{
			name: "id",
			message: "Enter the ID of the product you would like to buy",
			validate: function(id) {
				return isNaN(Number(id))==false;
			}
		},
		{
			name: "quantity",
			message: "Enter the quantity of product you would like to buy",
			validate: function(id) {
				return isNaN(Number(id))==false;
			}
		}		 
	]).then(function(answers) {
		selectId(answers);
	});
}

function selectId(answers) {
	client.query(`SELECT * FROM products WHERE id = ${answers.id}`, function(error, response) {
		if (response.rows.length == 0) {
			throw error;
		};
		var requested = answers.quantity;
		var inStock = response.rows[0].quantity;
		var price = response.rows[0].price;
		var orderTotal = requested * price;
		if (inStock >= requested) {
			var newQuantity = inStock - requested;
			console.log(`\n\nGreat, we have enough! We have placed your order and subtracted ${requested} item(s) from inventory, leaving ${newQuantity} item(s) remaining.\n\nYour order total is $${orderTotal}\n\n`);
			updateQuantity(answers.id,newQuantity);
		} else {
			console.log(`\n\nOh damn, we don't have enough!\n\n`);
		}
		// client.end();
		nextStep();
	});
}

function updateQuantity(id,newQuantity) {
	client.query(`UPDATE products SET quantity = ${newQuantity} WHERE id = ${id}`, function(error, response) {
		if (error) throw error;
	})
}

function nextStep() {
	inquirer.prompt([
		{
			type: "list",
			name: "next",
			choices: ["Make another order", "Exit"],
			message: "What would you like to do now?"
		}	 
	])
	.then(function(answers){
		if(answers.next!="Exit"){selectAll();};
	});
}