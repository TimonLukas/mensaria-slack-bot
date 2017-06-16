module.exports = class Dish {
  constructor (title, content, price) {
    this.title = title;
    this.content = content;
    this.price = price;
  }

  render () {
    return `*${this.title}* _(${this.price})_\r\n${this.content}`;
  }
};