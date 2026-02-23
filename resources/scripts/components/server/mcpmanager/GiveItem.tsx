import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner, faTimes, faChevronDown } from '@fortawesome/free-solid-svg-icons';
interface MinecraftItem {
    id: string;
    nama: string;
    displayName: string;
    stackSize: number;
}
interface GiveItemProps {
    nama?: string;
    value: string;
    onChange: (value: string) => void;
    onSelect: (item: MinecraftItem) => void;
    serverVersion?: string;
    placeholder?: string;
    disabled?: boolean;
    label?: string;
    description?: string;
    hasError?: boolean;
    error?: string;
}

const inputBaseStyle: React.CSSProperties = {
    resize: 'none',
    appearance: 'none',
    outline: 'none',
    width: '100%',
    minWidth: 0,
    padding: '0.75rem',
    paddingRight: '2.5rem',
    border: '1px solid var(--theme-border)',
    fontSize: '0.875rem',
    transition: 'all 150ms',
    backgroundColor: 'var(--theme-background)',
    color: 'var(--theme-text-base)',
    fontFamily: "'Electrolize', sans-serif",
    clipPath: 'polygon(0px 4px, 4px 0px, 100% 0px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0px 100%)',
};

const inputErrorStyle: React.CSSProperties = {
    ...inputBaseStyle,
    color: '#fecaca',
    borderColor: '#f87171',
};
const extractVersionNumber = (serverVersion?: string): string => {
    if (!serverVersion) return '1.20.4';
    const match = serverVersion.match(/(\d+\.\d+(?:\.\d+)?)/);
    return match ? match[1] : '1.20.4';
};
const getItemIconUrl = (itemId: string, serverVersion?: string): string => {
    const cleanId = itemId.replace('minecraft:', '');
    const mcVersion = extractVersionNumber(serverVersion);
    return `https://mc.nerothe.com/img/1.21.8/minecraft_${cleanId}.png`;
};
const formatItemName = (itemId: string): string => {
    const cleanId = itemId.replace('minecraft:', '');
    return cleanId
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};
const GiveItem: React.FC<GiveItemProps> = ({
    nama,
    value,
    onChange,
    onSelect,
    serverVersion,
    placeholder = 'Search for an item...',
    disabled = false,
    label,
    description,
    hasError,
    error,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState<MinecraftItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<MinecraftItem[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const [allItemsLoaded, setAllItemsLoaded] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fetchItems = useCallback(async () => {
        if (allItemsLoaded) return;
        setIsLoading(true);
        const FALLBACK_VERSION = '1.21.8';
        const mcVersion = extractVersionNumber(serverVersion);
        const tryFetchItems = async (mcVersion: string): Promise<any[]> => {
            const response = await fetch(
                `https://raw.githubusercontent.com/PrismarineJS/minecraft-data/refs/heads/master/data/pc/${mcVersion}/items.json`
            );
            if (!response.ok) {
                throw new Error(`Failed to fetch items for version ${mcVersion}`);
            }
            return response.json();
        };
        try {
            let data: any[];
            try {
                data = await tryFetchItems(mcVersion);
            } catch (error) {
                console.warn(`Version ${mcVersion} not found, falling back to ${FALLBACK_VERSION}`);
                data = await tryFetchItems(FALLBACK_VERSION);
            }
            const minecraftItems: MinecraftItem[] = data.map((item: any) => ({
                id: item.name,
                nama: item.name,
                displayName: item.displayName || formatItemName(item.name),
                stackSize: item.stackSize || 64,
            }));
            setItems(minecraftItems);
            setAllItemsLoaded(true);
        } catch (error) {
            console.error('Error fetching items:', error);
            setAllItemsLoaded(true);
        } finally {
            setIsLoading(false);
        }
    }, [serverVersion, allItemsLoaded]);
    useEffect(() => {
        if (!value.trim()) {
            setFilteredItems([]);
            setSelectedIndex(-1);
            return;
        }
        const searchTerm = value.toLowerCase();
        const filtered = items
            .filter(
                (item) =>
                    item.displayName.toLowerCase().includes(searchTerm) ||
                    item.nama.toLowerCase().includes(searchTerm) ||
                    item.id.toLowerCase().includes(searchTerm)
            )
            .slice(0, 10);
        setFilteredItems(filtered);
        setSelectedIndex(filtered.length > 0 ? 0 : -1);
    }, [value, items]);
    const updatePosition = useCallback(() => {
        if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    }, []);
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return;
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < filteredItems.length) {
                    handleSelectItem(filteredItems[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
        }
    };
    const handleSelectItem = (item: MinecraftItem) => {
        onChange(item.nama);
        onSelect(item);
        setIsOpen(false);
        setSelectedIndex(-1);
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        setIsOpen(true);
        updatePosition();
        if (!allItemsLoaded && !isLoading) {
            fetchItems();
        }
    };
    const handleFocus = () => {
        setIsOpen(true);
        updatePosition();
        if (!allItemsLoaded && !isLoading) {
            fetchItems();
        }
    };
    const handleClear = () => {
        onChange('');
        setIsOpen(false);
        setSelectedIndex(-1);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(event.target as Node) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setSelectedIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    return (
        <div style={{ position: 'relative' }}>
            {label && (
                <label
                    htmlFor={nama}
                    style={{
                        display: 'block',
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        color: 'var(--theme-text-muted)',
                        marginBottom: '0.375rem',
                        fontFamily: "'Orbitron', sans-serif",
                        letterSpacing: '0.05em',
                    }}
                >
                    {label}
                </label>
            )}
            <input
                ref={inputRef}
                type='text'
                value={value}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                style={{
                    ...(hasError ? inputErrorStyle : inputBaseStyle),
                    ...(disabled ? { opacity: 0.75 } : {}),
                }}
            />
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--theme-text-muted)',
                }}>
                    <FontAwesomeIcon icon={faSpinner} spin />
                </div>
            )}
            {value.trim() && !isLoading && (
                <button
                    onClick={handleClear}
                    style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--theme-text-muted)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                    }}
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            )}
            {isOpen && filteredItems.length > 0 && (
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'fixed',
                        backgroundColor: 'var(--theme-background-secondary)',
                        border: '1px solid var(--theme-border)',
                        maxHeight: '16rem',
                        overflowY: 'auto',
                        zIndex: 9999,
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: dropdownPosition.width,
                        clipPath: 'polygon(0px 5px, 5px 0px, 100% 0px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0px 100%)',
                    }}
                >
                    {filteredItems.map((item, index) => (
                        <div
                            key={item.id}
                            onClick={() => handleSelectItem(item)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.5rem 0.75rem',
                                cursor: 'pointer',
                                transition: 'all 150ms',
                                borderBottom: index < filteredItems.length - 1 ? '1px solid var(--theme-border)' : 'none',
                                backgroundColor: index === selectedIndex
                                    ? 'color-mix(in srgb, var(--theme-primary) 15%, transparent)'
                                    : 'transparent',
                            }}
                        >
                            <img
                                src={getItemIconUrl(item.id, serverVersion)}
                                alt={item.displayName}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                                style={{
                                    width: '1.5rem',
                                    height: '1.5rem',
                                    marginRight: '0.75rem',
                                    border: '1px solid var(--theme-border)',
                                    clipPath: 'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)',
                                }}
                            />
                            <div style={{ flexGrow: 1 }}>
                                <div style={{
                                    fontWeight: 500,
                                    color: 'var(--theme-text-base)',
                                    fontSize: '0.875rem',
                                    fontFamily: "'Electrolize', sans-serif",
                                }}>
                                    {item.displayName}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--theme-text-muted)',
                                    fontFamily: "'Electrolize', sans-serif",
                                }}>
                                    {item.nama}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {hasError && error ? (
                <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#fecaca' }}>
                    {error.charAt(0).toUpperCase() + error.slice(1)}
                </p>
            ) : description ? (
                <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--theme-text-muted)' }}>
                    {description}
                </p>
            ) : null}
        </div>
    );
};
export default GiveItem;
