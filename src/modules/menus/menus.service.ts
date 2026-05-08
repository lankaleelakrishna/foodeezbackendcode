import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuCategoryEntity } from '../../entities/menu-category.entity';
import { MenuItemEntity } from '../../entities/menu-item.entity';
import { MenuAddonEntity } from '../../entities/menu-addon.entity';
import { MenuPricingRuleEntity } from '../../entities/menu-pricing-rule.entity';
import { BranchEntity } from '../../entities/branch.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateMenuAddonDto } from './dto/create-menu-addon.dto';
import { UpdateMenuAddonDto } from './dto/update-menu-addon.dto';
import { CreateMenuPricingRuleDto } from './dto/create-menu-pricing-rule.dto';
import { UpdateMenuPricingRuleDto } from './dto/update-menu-pricing-rule.dto';
import { MenuBulkUploadDto } from './dto/menu-bulk-upload.dto';
import { MenuScanService } from './scan/menu-scan.service';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(MenuCategoryEntity)
    private readonly categoryRepository: Repository<MenuCategoryEntity>,
    @InjectRepository(MenuItemEntity)
    private readonly itemRepository: Repository<MenuItemEntity>,
    @InjectRepository(MenuAddonEntity)
    private readonly addonRepository: Repository<MenuAddonEntity>,
    @InjectRepository(MenuPricingRuleEntity)
    private readonly pricingRuleRepository: Repository<MenuPricingRuleEntity>,
    @InjectRepository(BranchEntity)
    private readonly branchRepository: Repository<BranchEntity>,
    private readonly menuScanService: MenuScanService,
  ) {}

  async createCategory(branchId: string, payload: CreateCategoryDto) {
    const branch = await this.branchRepository.findOne({ where: { id: branchId } });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }
    const category = this.categoryRepository.create({ ...payload, branch });
    return this.categoryRepository.save(category);
  }

  async updateCategory(categoryId: string, payload: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { id: categoryId }, relations: ['branch'] });
    if (!category) {
      throw new NotFoundException('Menu category not found');
    }
    Object.assign(category, payload);
    return this.categoryRepository.save(category);
  }

  async createItem(branchId: string, payload: CreateMenuItemDto) {
    const branch = await this.branchRepository.findOne({ where: { id: branchId } });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }
    const category = await this.categoryRepository.findOne({ where: { id: payload.categoryId, branch: { id: branchId } } });
    if (!category) {
      throw new NotFoundException('Menu category not found');
    }
    const item = this.itemRepository.create({
      ...payload,
      branch,
      category,
      isVisible: payload.isVisible ?? true,
      isInStock: payload.isInStock ?? true,
      autoOutOfStock: payload.autoOutOfStock ?? true,
      stockOnHand: payload.stockOnHand ?? 0,
      stockThreshold: payload.stockThreshold ?? 0,
      minOrderQuantity: payload.minOrderQuantity ?? 1,
      maxOrderQuantity: payload.maxOrderQuantity ?? 0,
      sortOrder: payload.sortOrder ?? 0,
    });
    return this.itemRepository.save(item);
  }

  async findItems(branchId: string) {
    return this.itemRepository.find({ where: { branch: { id: branchId } }, relations: ['category', 'addons', 'pricingRules'] });
  }

  async findCategories(branchId: string) {
    return this.categoryRepository.find({ where: { branch: { id: branchId } }, relations: ['items'] });
  }

  async updateItem(itemId: string, payload: UpdateMenuItemDto) {
    const item = await this.itemRepository.findOne({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException('Menu item not found');
    }
    Object.assign(item, payload);
    return this.itemRepository.save(item);
  }

  async createAddon(itemId: string, payload: CreateMenuAddonDto) {
    const item = await this.itemRepository.findOne({ where: { id: itemId }, relations: ['branch'] });
    if (!item) {
      throw new NotFoundException('Menu item not found');
    }
    const addon = this.addonRepository.create({ ...payload, item, branch: item.branch });
    return this.addonRepository.save(addon);
  }

  async updateAddon(addonId: string, payload: UpdateMenuAddonDto) {
    const addon = await this.addonRepository.findOne({ where: { id: addonId } });
    if (!addon) {
      throw new NotFoundException('Menu addon not found');
    }
    Object.assign(addon, payload);
    return this.addonRepository.save(addon);
  }

  async findAddons(itemId: string) {
    return this.addonRepository.find({ where: { item: { id: itemId } } });
  }

  async createPricingRule(itemId: string, payload: CreateMenuPricingRuleDto) {
    const item = await this.itemRepository.findOne({ where: { id: itemId }, relations: ['branch'] });
    if (!item) {
      throw new NotFoundException('Menu item not found');
    }
    const pricingRule = this.pricingRuleRepository.create({
      ...payload,
      item,
      branch: item.branch,
      startsAt: payload.startsAt ? new Date(payload.startsAt) : undefined,
      endsAt: payload.endsAt ? new Date(payload.endsAt) : undefined,
    });
    return this.pricingRuleRepository.save(pricingRule);
  }

  async updatePricingRule(ruleId: string, payload: UpdateMenuPricingRuleDto) {
    const pricingRule = await this.pricingRuleRepository.findOne({ where: { id: ruleId } });
    if (!pricingRule) {
      throw new NotFoundException('Pricing rule not found');
    }
    Object.assign(pricingRule, payload);
    return this.pricingRuleRepository.save(pricingRule);
  }

  async findPricingRules(itemId: string) {
    return this.pricingRuleRepository.find({ where: { item: { id: itemId } } });
  }

  scanMenu(imageBase64: string, mimeType = 'image/jpeg') {
    return this.menuScanService.scan(imageBase64, mimeType);
  }

  async bulkUpload(branchId: string, payload: MenuBulkUploadDto) {
    const branch = await this.branchRepository.findOne({ where: { id: branchId } });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const categories = payload.categories.map((categoryPayload) => {
      const category = this.categoryRepository.create({
        name: categoryPayload.name,
        displayName: categoryPayload.displayName,
        branch,
      });
      return category;
    });

    const savedCategories = await this.categoryRepository.save(categories);

    const items = [];
    for (const [index, categoryPayload] of payload.categories.entries()) {
      const category = savedCategories[index];
      for (const itemPayload of categoryPayload.items) {
        const item = this.itemRepository.create({
          ...itemPayload,
          branch,
          category,
          isVisible: itemPayload.isVisible ?? true,
          isInStock: itemPayload.isInStock ?? true,
        });
        items.push(item);
      }
    }

    return this.itemRepository.save(items);
  }
}
