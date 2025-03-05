// Родительский класс Оружие
class Weapon {
    constructor(name, damage, critMultiplier, critChance) {
      this.name = name;
      this.damage = damage;
      this.critMultiplier = critMultiplier;
      this.critChance = critChance;
    }
  
    attack() {
      const isCritical = Math.random() < this.critChance;
      let finalDamage = isCritical ? this.damage * this.critMultiplier : this.damage;
      
      console.log(
        `${this.name} наносит ${finalDamage} урона${isCritical ? " (КРИТ!)" : ""}.`
      );
  
      return finalDamage; // Возвращаем урон для использования в эффектах
    }
  }
  
  // Базовый класс меча
  class Sword extends Weapon {
    constructor(name, damage, critMultiplier, critChance) {
      super(name, damage, critMultiplier, critChance);
    }
  
    attack() {
      const baseDamage = super.attack(); // Вызываем атаку родителя
      this.applyEffect(baseDamage); // Применяем уникальный эффект меча
    }
  
    applyEffect(damage) {
      // Уникальный эффект (переопределяется в наследниках)
    }
  }
  
  // Железный меч (без особых эффектов)
  class IronSword extends Sword {
    constructor() {
      super("Железный меч", 12, 2, 0.2);
    }
  }
  
  // Огненный меч (добавляет урон от горения)
  class FireSword extends Sword {
    constructor() {
      super("Огненный меч", 15, 2.5, 0.3);
    }
  
    applyEffect(damage) {
      const burnDamage = Math.round(damage * 0.3); // Доп. урон 30% от урона меча
      console.log(`🔥 Враг горит и получает дополнительно ${burnDamage} урона!`);
    }
  }
  
  // Проклятый клинок (ворует часть урона в виде лечения)
  class CursedBlade extends Sword {
    constructor() {
      super("Проклятый клинок", 8, 3, 0.5);
    }
  
    applyEffect(damage) {
      const healAmount = Math.round(damage * 0.2); // Лечение 20% от урона
      console.log(`🩸 Проклятый клинок впитывает ${healAmount} здоровья!`);
    }
  }
  
  // Тестирование
  const ironSword = new IronSword();
  const fireSword = new FireSword();
  const cursedBlade = new CursedBlade();
  
  console.log("\n=== Железный меч ===");
  ironSword.attack();
  
  console.log("\n=== Огненный меч ===");
  fireSword.attack();
  
  console.log("\n=== Проклятый клинок ===");
  cursedBlade.attack();
  