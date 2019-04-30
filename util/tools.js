class tbp {
  storage = {};
  constructor(table) {}

  extract(params) {}

  /**
   *
   * @param {string} timeLabel A string for the timestamp.
   */
  convertTime(timeLabel) {
    return timeLabel.split("_")[0].slice(0, 2);
  }
}
