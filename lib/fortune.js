var fortunes = [
    "Conquer your fear or they will conquer you.",
    "Rivers need springs.",
    "Do not fear what you don't know.",
    "You will have a pleasant surprise.",
    "Whenever possible, keep it simple."
];

exports.getFortune = function () {
    var randomFortune = Math.floor(Math.random()*fortunes.length);
    return fortunes[randomFortune];
}