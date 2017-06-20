module.exports = class Dish {
  constructor (title, content, price) {
    this.title = title;
    this.contents = typeof content === "object" ? content : content.split(', ');
    this.price = price;
  }

  render () {
    return `*${this.title}* _(${this.price})_\r\n• ${this.contents.join('\r\n• ')}`;
  }

  filteredContents(commonElements) {
    return new Dish(
      this.title,
      this.contents.filter(element => {
        if(commonElements.indexOf(element) === -1) {
          return element;
        }
      }),
      this.price
    );
  }
};