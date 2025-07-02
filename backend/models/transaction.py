class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date)
    item = Column(String)
    category = Column(String)
    amount = Column(Float)
    type = Column(String)  # 'expense' or 'revenue'

    user = relationship("User", back_populates="transactions")
